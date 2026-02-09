using DevNest.Data;
using DevNest.DTOs.Jobs;
using Microsoft.EntityFrameworkCore;

namespace DevNest.Services.Jobs;

public class JobSearchService : IJobSearchService
{
    private readonly ApplicationDbContext db;

    public JobSearchService(ApplicationDbContext db) => this.db = db;

    // ✅ Strongly-typed row for EF translation (NO dynamic)
    private sealed class JobRow
    {
        public required DevNest.Models.Job J { get; init; }
        public DevNest.Models.Category? C { get; init; }
        public required DevNest.Models.Company Co { get; init; }
    }

    private static List<string> SplitCsv(string? raw)
        => (raw ?? "")
            .Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(x => x.Trim())
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct()
            .ToList();

    // ✅ shared builder: same filtering rules for both Search and Facets
    private async Task<IQueryable<JobRow>> BuildBaseQueryAsync(JobSearchQuery query, CancellationToken ct)
    {
        var term = query.Q?.Trim();
        var categorySlug = query.CategorySlug?.Trim();

        // multi-select (comma-separated)
        var locations = SplitCsv(query.Location);
        var exps = SplitCsv(query.ExperienceLevel);
        var jobTypes = SplitCsv(query.JobType);
        var salaryRanges = SplitCsv(query.SalaryRange);

        // resolve tech -> TechId
        int? techId = null;
        var techInput = query.Tech?.Trim();
        if (!string.IsNullOrWhiteSpace(techInput))
        {
            techId = await db.Techs
                .AsNoTracking()
                .Where(t => t.Slug == techInput || t.Name == techInput)
                .Select(t => (int?)t.Id)
                .FirstOrDefaultAsync(ct);
        }

        // Base query (join once)
        IQueryable<JobRow> baseQuery =
            from j in db.Jobs.AsNoTracking()
            join c in db.Categories.AsNoTracking() on j.CategoryId equals c.Id into cj
            from c in cj.DefaultIfEmpty()
            join co in db.Companies.AsNoTracking() on j.CompanyId equals co.Id
            where j.Status == "Active"
            select new JobRow { J = j, C = c, Co = co };

        // If tech was provided but not found => empty result set
        if (!string.IsNullOrWhiteSpace(techInput) && !techId.HasValue)
            return baseQuery.Where(_ => false);

        // Text search (NULL-safe) + ✅ Tech search
        if (!string.IsNullOrWhiteSpace(term))
        {
            var t = term;

            baseQuery = baseQuery.Where(x =>
                (x.J.Title ?? "").Contains(t) ||
                (x.J.Description ?? "").Contains(t) ||
                (x.Co.Name ?? "").Contains(t) ||

                // ✅ match by any tech name/slug attached to the job
                (
                    from jt in db.JobTechs.AsNoTracking()
                    join tech in db.Techs.AsNoTracking() on jt.TechId equals tech.Id
                    where jt.JobId == x.J.Id
                    select tech
                ).Any(tech =>
                    (tech.Name ?? "").Contains(t) ||
                    (tech.Slug ?? "").Contains(t)
                )
            );
        }


        // Category filter by slug
        if (!string.IsNullOrWhiteSpace(categorySlug))
            baseQuery = baseQuery.Where(x => x.C != null && x.C.Slug == categorySlug);

        // ----------------------------
        // ✅ Location + Remote logic
        // - If Remote=true AND locations selected => UNION (OR)
        // - Otherwise behave normally (AND)
        // ----------------------------
        var remoteSelected = query.Remote.HasValue && query.Remote.Value == true;
        var hasLocations = locations.Count > 0;

        if (remoteSelected && hasLocations)
        {
            baseQuery = baseQuery.Where(x =>
                x.J.IsRemote == true ||
                (x.J.Location != null && locations.Contains(x.J.Location))
            );
        }
        else
        {
            if (hasLocations)
                baseQuery = baseQuery.Where(x => x.J.Location != null && locations.Contains(x.J.Location));

            if (query.Remote.HasValue)
                baseQuery = baseQuery.Where(x => x.J.IsRemote == query.Remote.Value);
        }

        // ExperienceLevel filter (multi)
        if (exps.Count > 0)
            baseQuery = baseQuery.Where(x => x.J.ExperienceLevel != null && exps.Contains(x.J.ExperienceLevel));

        // JobType filter (multi)
        if (jobTypes.Count > 0)
            baseQuery = baseQuery.Where(x => x.J.JobType != null && jobTypes.Contains(x.J.JobType));

        // SalaryRange filter (multi)
        if (salaryRanges.Count > 0)
            baseQuery = baseQuery.Where(x => x.J.SalaryRange != null && salaryRanges.Contains(x.J.SalaryRange));

        // Tech filter by TechId
        if (techId.HasValue)
        {
            var id = techId.Value;
            baseQuery = baseQuery.Where(x =>
                db.JobTechs.AsNoTracking().Any(jt => jt.JobId == x.J.Id && jt.TechId == id)
            );
        }

        return baseQuery;
    }

    public async Task<PagedResult<JobCardDto>> SearchAsync(JobSearchQuery query, CancellationToken ct = default)
    {
        // Guardrails
        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = query.PageSize is < 5 or > 50 ? 20 : query.PageSize;
        var sort = (query.Sort ?? "newest").Trim().ToLowerInvariant();

        var baseQuery = await BuildBaseQueryAsync(query, ct);

        // Sorting
        baseQuery = sort switch
        {
            "deadline" => baseQuery.OrderBy(x => x.J.Deadline),
            _ => baseQuery.OrderByDescending(x => x.J.PublishedAt ?? x.J.CreatedAt),
        };

        // Total items BEFORE paging
        var totalItems = await baseQuery.CountAsync(ct);
        var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

        // Page items
        var raw = await baseQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new { x.J, x.C, x.Co })
            .ToListAsync(ct);

        // Load techs for these jobs in ONE query
        var jobIds = raw.Select(r => r.J.Id).ToArray();

        var techsByJob = jobIds.Length == 0
            ? new Dictionary<int, List<TechIconDto>>()
            : await (
                from jt in db.JobTechs.AsNoTracking()
                join t in db.Techs.AsNoTracking() on jt.TechId equals t.Id
                where jobIds.Contains(jt.JobId)
                group t by jt.JobId into g
                select new
                {
                    JobId = g.Key,
                    Techs = g
                        .GroupBy(x => x.Id)
                        .Select(gg => gg.Select(x => new TechIconDto
                        {
                            Id = x.Id,
                            Name = x.Name,
                            Slug = x.Slug,
                            LogoUrl = x.LogoUrl
                        }).First())
                        .ToList()
                }
            ).ToDictionaryAsync(x => x.JobId, x => x.Techs, ct);

        var items = raw.Select(x => new JobCardDto
        {
            Id = x.J.Id,
            Title = x.J.Title,
            Location = x.J.Location,
            IsRemote = x.J.IsRemote,
            JobType = x.J.JobType,
            ExperienceLevel = x.J.ExperienceLevel,
            Status = x.J.Status,
            CreatedAt = x.J.CreatedAt,
            Deadline = x.J.Deadline,

            CompanyId = x.J.CompanyId,
            CompanyName = x.Co.Name,
            CompanyLogoUrl = x.Co.LogoUrl,

            CategoryId = x.J.CategoryId,
            CategoryName = x.C?.Name,
            CategorySlug = x.C?.Slug,

            Techs = techsByJob.TryGetValue(x.J.Id, out var list) ? list : new List<TechIconDto>()
        }).ToList();

        return new PagedResult<JobCardDto>
        {
            Items = items,
            TotalItems = totalItems,
            TotalPages = totalPages,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<JobFacetsDto> GetFacetsAsync(JobSearchQuery query, CancellationToken ct = default)
    {
        var baseQuery = await BuildBaseQueryAsync(query, ct);

        var locations = await baseQuery
            .Where(x => x.J.Location != null && x.J.Location != "")
            .GroupBy(x => x.J.Location!)
            .Select(g => new FacetItemDto
            {
                Value = g.Key,
                Count = g.Count()
            })
            .OrderByDescending(x => x.Count)
            .ThenBy(x => x.Value)
            .ToListAsync(ct);

        var experienceLevels = await baseQuery
            .Where(x => x.J.ExperienceLevel != null && x.J.ExperienceLevel != "")
            .GroupBy(x => x.J.ExperienceLevel!)
            .Select(g => new FacetItemDto
            {
                Value = g.Key,
                Count = g.Count()
            })
            .OrderByDescending(x => x.Count)
            .ThenBy(x => x.Value)
            .ToListAsync(ct);

        var jobTypes = await baseQuery
            .Where(x => x.J.JobType != null && x.J.JobType != "")
            .GroupBy(x => x.J.JobType!)
            .Select(g => new FacetItemDto
            {
                Value = g.Key,
                Count = g.Count()
            })
            .OrderByDescending(x => x.Count)
            .ThenBy(x => x.Value)
            .ToListAsync(ct);

        var salaryRanges = await baseQuery
            .Where(x => x.J.SalaryRange != null && x.J.SalaryRange != "")
            .GroupBy(x => x.J.SalaryRange!)
            .Select(g => new FacetItemDto
            {
                Value = g.Key,
                Count = g.Count()
            })
            .OrderByDescending(x => x.Count)
            .ThenBy(x => x.Value)
            .ToListAsync(ct);

        return new JobFacetsDto
        {
            Locations = locations,
            ExperienceLevels = experienceLevels,
            JobTypes = jobTypes,
            SalaryRanges = salaryRanges
        };
    }
}
