using DevNest.Data;
using DevNest.DTOs.Jobs;
using DevNest.Models;
using Microsoft.EntityFrameworkCore;

namespace DevNest.Services.Jobs;

public class JobSearchService : IJobSearchService
{
    private readonly ApplicationDbContext db;

    public JobSearchService(ApplicationDbContext db)
    {
        this.db = db;
    }

    public async Task<PagedResult<JobCardDto>> SearchAsync(JobSearchQuery query, CancellationToken ct = default)
    {
        // Base query
        IQueryable<Job> q = db.Jobs
            .AsNoTracking()
            .Include(j => j.Company)
            .Include(j => j.JobTechs);

        // Only active jobs by default (optional, but recommended)
        q = q.Where(j => j.Status == "Active");

        // Text search (basic LIKE search)
        if (!string.IsNullOrWhiteSpace(query.Q))
        {
            var term = query.Q.Trim();

            q = q.Where(j =>
                j.Title.Contains(term) ||
                j.Description.Contains(term) ||
                j.Company.Name.Contains(term));
        }

        // Category filter by slug
        if (!string.IsNullOrWhiteSpace(query.CategorySlug))
        {
            var slug = query.CategorySlug.Trim();

            // If you have navigation to Category, use it. Otherwise join Categories table by CategoryId.
            q = q.Where(j => j.CategoryId != null &&
                             db.Categories.Any(c => c.Id == j.CategoryId && c.Slug == slug));
        }

        // Tech filter (JobTechs)
        if (!string.IsNullOrWhiteSpace(query.Tech))
        {
            var tech = query.Tech.Trim();
            q = q.Where(j => j.JobTechs != null && j.JobTechs.Any(t => t.Tech == tech));
        }

        // Location filter
        if (!string.IsNullOrWhiteSpace(query.Location))
        {
            var loc = query.Location.Trim();
            q = q.Where(j => j.Location != null && j.Location.Contains(loc));
        }

        // Remote filter
        if (query.Remote.HasValue)
        {
            q = q.Where(j => j.IsRemote == query.Remote.Value);
        }

        // ExperienceLevel filter
        if (!string.IsNullOrWhiteSpace(query.ExperienceLevel))
        {
            var level = query.ExperienceLevel.Trim();
            q = q.Where(j => j.ExperienceLevel == level);
        }

        // JobType filter
        if (!string.IsNullOrWhiteSpace(query.JobType))
        {
            var jt = query.JobType.Trim();
            q = q.Where(j => j.JobType == jt);
        }

        // Sorting
        q = query.Sort.ToLowerInvariant() switch
        {
            "deadline" => q.OrderBy(j => j.Deadline),
            _ => q.OrderByDescending(j => j.CreatedAt),
        };

        // Total count (before paging)
        var total = await q.CountAsync(ct);

        // Paging guardrails
        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = query.PageSize is < 1 or > 100 ? 20 : query.PageSize;

        var items = await q
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(j => new JobCardDto
            {
                Id = j.Id,
                Title = j.Title,
                Location = j.Location,
                IsRemote = j.IsRemote,
                JobType = j.JobType,
                ExperienceLevel = j.ExperienceLevel,
                Status = j.Status,
                CreatedAt = j.CreatedAt,
                Deadline = j.Deadline,

                CompanyId = j.CompanyId,
                CompanyName = j.Company.Name,
                CompanyLogoUrl = j.Company.LogoUrl,

                CategoryId = j.CategoryId,
                CategoryName = j.CategoryId == null
                    ? null
                    : db.Categories.Where(c => c.Id == j.CategoryId).Select(c => c.Name).FirstOrDefault(),
                CategorySlug = j.CategoryId == null
                    ? null
                    : db.Categories.Where(c => c.Id == j.CategoryId).Select(c => c.Slug).FirstOrDefault(),

                Techs = j.JobTechs == null
                    ? new List<string>()
                    : j.JobTechs.Select(t => t.Tech).Distinct().ToList()
            })
            .ToListAsync(ct);

        return new PagedResult<JobCardDto>
        {
            Items = items,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }
}
