using DevNest.Data;
using DevNest.DTOs.Jobs;
using DevNest.Models;
using Microsoft.EntityFrameworkCore;

namespace DevNest.Services.Jobs;

public class JobReadService : IJobReadService
{
    private readonly ApplicationDbContext db;

    public JobReadService(ApplicationDbContext db) => this.db = db;

    public async Task<JobCardDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var categoryMap = await db.Categories
            .AsNoTracking()
            .ToDictionaryAsync(c => c.Id, c => new { c.Name, c.Slug }, ct);

        var job = await db.Jobs
            .AsNoTracking()
            .Include(j => j.Company)
            .Include(j => j.JobTechs)
            .Where(j => j.Id == id)
            .Select(j => new JobCardDto
            {
                Id = j.Id,
                Title = j.Title,
                Location = j.Location,
                IsRemote = j.IsRemote,
                JobType = j.JobType,
                ExperienceLevel = j.ExperienceLevel,
                CreatedAt = j.CreatedAt,
                Deadline = j.Deadline,

                CompanyId = j.CompanyId,
                CompanyName = j.Company.Name,
                CompanyLogoUrl = j.Company.LogoUrl,

                CategoryId = j.CategoryId,
                CategoryName = j.CategoryId != null && categoryMap.ContainsKey(j.CategoryId) ? categoryMap[j.CategoryId].Name : null,
                CategorySlug = j.CategoryId != null && categoryMap.ContainsKey(j.CategoryId) ? categoryMap[j.CategoryId].Slug : null,

                Techs = j.JobTechs == null ? new List<string>() : j.JobTechs.Select(t => t.Tech).Distinct().ToList(),
            })
            .FirstOrDefaultAsync(ct);

        return job;
    }

    public async Task<IReadOnlyList<JobCardDto>> GetLatestAsync(int take = 10, CancellationToken ct = default)
    {
        take = take is < 1 or > 50 ? 10 : take;

        var categoryMap = await db.Categories
            .AsNoTracking()
            .ToDictionaryAsync(c => c.Id, c => new { c.Name, c.Slug }, ct);

        return await db.Jobs
            .AsNoTracking()
            .Where(j => j.Status == "Active")
            .Include(j => j.Company)
            .Include(j => j.JobTechs)
            .OrderByDescending(j => j.CreatedAt)
            .Take(take)
            .Select(j => new JobCardDto
            {
                Id = j.Id,
                Title = j.Title,
                Location = j.Location,
                IsRemote = j.IsRemote,
                JobType = j.JobType,
                ExperienceLevel = j.ExperienceLevel,
                CreatedAt = j.CreatedAt,
                Deadline = j.Deadline,

                CompanyId = j.CompanyId,
                CompanyName = j.Company.Name,
                CompanyLogoUrl = j.Company.LogoUrl,

                CategoryId = j.CategoryId,
                CategoryName = j.CategoryId != null && categoryMap.ContainsKey(j.CategoryId) ? categoryMap[j.CategoryId].Name : null,
                CategorySlug = j.CategoryId != null && categoryMap.ContainsKey(j.CategoryId) ? categoryMap[j.CategoryId].Slug : null,

                Techs = j.JobTechs == null ? new List<string>() : j.JobTechs.Select(t => t.Tech).Distinct().ToList(),
            })
            .ToListAsync(ct);
    }
}
