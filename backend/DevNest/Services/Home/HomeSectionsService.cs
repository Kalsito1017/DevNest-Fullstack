using DevNest.Data;
using DevNest.DTOs.Home;
using Microsoft.EntityFrameworkCore;

namespace DevNest.Services.Home
{
    public class HomeSectionsService : IHomeSectionsService
    {
        private readonly ApplicationDbContext db;

        public HomeSectionsService(ApplicationDbContext db) => this.db = db;

        private static string? NormalizeLocation(string? location)
        {
            if (string.IsNullOrWhiteSpace(location)) return null;

            var l = location.Trim();

            // accept slugs too
            return l.ToLowerInvariant() switch
            {
                "sofia" => "Sofia",
                "varna" => "Varna",
                "plovdiv" => "Plovdiv",
                "burgas" => "Burgas",
                "ruse" => "Ruse",
                "remote" => "Remote",
                _ => l
            };
        }

        public async Task<IReadOnlyList<HomeSectionDto>> GetSectionsAsync(
            int takeTechs,
            string? location = null,
            bool remote = false,
            CancellationToken ct = default)
        {
            takeTechs = takeTechs is < 1 or > 12 ? 6 : takeTechs;

            var visibleStatuses = new[] { "Active", "Open", "Published" };

            // ✅ Unify Remote model: remote=true => location="Remote"
            if (remote && string.IsNullOrWhiteSpace(location))
                location = "Remote";

            var loc = NormalizeLocation(location);

            // Base visible jobs query
            IQueryable<Models.Job> visibleJobs = db.Jobs
                .AsNoTracking()
                .Where(j => visibleStatuses.Contains(j.Status));

            // ✅ Apply filter ONLY by location (Remote is also location)
            if (!string.IsNullOrWhiteSpace(loc))
            {
                visibleJobs = visibleJobs.Where(j => j.Location != null && j.Location.Trim() == loc);
            }

            // Categories shown on home
            var categories = await db.Categories
                .AsNoTracking()
                .Select(c => new { c.Id, c.Name, c.Slug, c.IconUrl })
                .ToListAsync(ct);

            // Job counts per category (filtered)
            var jobsCountByCategory = await visibleJobs
                .Where(j => j.CategoryId != null)
                .GroupBy(j => j.CategoryId!)
                .Select(g => new { CategoryId = g.Key, Count = g.Count() })
                .ToListAsync(ct);

            var categoryCountMap = jobsCountByCategory
                .ToDictionary(x => x.CategoryId, x => x.Count);

            // Tech counts per category (filtered) (exclude language techs "lang-")
            var techCountsQuery = db.JobTechs
                .AsNoTracking()
                .Where(jt => jt.Job.CategoryId != null)
                .Where(jt => jt.TechId != null)
                .Where(jt => visibleStatuses.Contains(jt.Job.Status))
                .Where(jt => !jt.TechRef.Slug.StartsWith("lang-"));

            // ✅ Same location filter for tech query
            if (!string.IsNullOrWhiteSpace(loc))
            {
                techCountsQuery = techCountsQuery
                    .Where(jt => jt.Job.Location != null && jt.Job.Location.Trim() == loc);
            }

            var techCounts = await techCountsQuery
                .GroupBy(jt => new { CategoryId = jt.Job.CategoryId!, TechId = jt.TechId!.Value })
                .Select(g => new
                {
                    g.Key.CategoryId,
                    g.Key.TechId,
                    JobsCount = g.Select(x => x.JobId).Distinct().Count()
                })
                .ToListAsync(ct);

            // Tech metadata lookup
            var techMeta = await db.Techs
                .AsNoTracking()
                .Select(t => new { t.Id, t.Name, t.Slug, t.LogoUrl })
                .ToDictionaryAsync(t => t.Id, ct);

            // Build pills per category
            var techByCategory = techCounts
                .GroupBy(x => x.CategoryId)
                .ToDictionary(
                    g => g.Key,
                    g => g.OrderByDescending(x => x.JobsCount)
                          .Take(takeTechs)
                          .Select(x =>
                          {
                              if (!techMeta.TryGetValue(x.TechId, out var meta))
                                  return null;

                              return new HomeTechDto
                              {
                                  TechId = meta.Id,
                                  TechName = meta.Name,
                                  TechSlug = meta.Slug,
                                  LogoUrl = meta.LogoUrl,
                                  JobsCount = x.JobsCount
                              };
                          })
                          .Where(x => x != null)
                          .Select(x => x!)
                          .ToList()
                );

            var result = categories
                .Select(c => new HomeSectionDto
                {
                    CategoryId = c.Id,
                    CategoryName = c.Name,
                    CategorySlug = c.Slug,
                    IconUrl = c.IconUrl,
                    JobsCount = categoryCountMap.TryGetValue(c.Id, out var cnt) ? cnt : 0,
                    Techs = techByCategory.TryGetValue(c.Id, out var pills) ? pills : new List<HomeTechDto>()
                })
                .OrderByDescending(x => x.JobsCount)
                .ToList();

            return result;
        }
    }
}
