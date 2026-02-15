using DevNest.Data;
using DevNest.DTOs.Home;
using DevNest.Models.Jobs;
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
            IQueryable<Job> visibleJobs = db.Jobs
                .AsNoTracking()
                .Where(j => visibleStatuses.Contains(j.Status));

            // ✅ Apply filter ONLY by location (Remote is also location)
            if (!string.IsNullOrWhiteSpace(loc))
            {
                visibleJobs = visibleJobs.Where(j =>
                    j.Location != null && j.Location.Trim() == loc);
            }

            // Categories shown on home
            var categories = await db.Categories
                .AsNoTracking()
                .Select(c => new { c.Id, c.Name, c.Slug, c.IconUrl })
                .ToListAsync(ct);

            // ✅ Job counts per category (filtered)
            // NOTE: assumes Job.CategoryId is NON-nullable int (based on your CS0472 tooltip)
            var jobsCountByCategory = await visibleJobs
                .GroupBy(j => j.CategoryId)
                .Select(g => new { CategoryId = g.Key, Count = g.Count() })
                .ToListAsync(ct);

            var categoryCountMap = jobsCountByCategory
                .ToDictionary(x => x.CategoryId, x => x.Count);

            // ✅ Tech counts per category (filtered) (exclude language techs "lang-")
            // NOTE: TechRef removed, so we join Techs via TechId and filter by Tech.Slug
            var techCountsQuery =
                from jt in db.JobTechs.AsNoTracking()
                join t in db.Techs.AsNoTracking() on jt.TechId equals t.Id
                where jt.TechId != null
                      && visibleStatuses.Contains(jt.Job.Status)
                      && !t.Slug.StartsWith("lang-")
                select new { jt, t };

            // ✅ Same location filter for tech query
            if (!string.IsNullOrWhiteSpace(loc))
            {
                techCountsQuery = techCountsQuery.Where(x =>
                    x.jt.Job.Location != null && x.jt.Job.Location.Trim() == loc);
            }

            var techCounts = await techCountsQuery
                .GroupBy(x => new { CategoryId = x.jt.Job.CategoryId, TechId = x.t.Id })
                .Select(g => new
                {
                    g.Key.CategoryId,
                    g.Key.TechId,
                    JobsCount = g.Select(x => x.jt.JobId).Distinct().Count()
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
               CategoryName = c.Name ?? "",          // if Name is nullable in DB
               CategorySlug = c.Slug ?? "",          // ✅ fixes CS8601
               IconUrl = c.IconUrl,                 // keep nullable if DTO allows it
               JobsCount = categoryCountMap.TryGetValue(c.Id, out var cnt) ? cnt : 0,
               Techs = techByCategory.TryGetValue(c.Id, out var pills) ? pills : new List<HomeTechDto>()
           })
           .OrderByDescending(x => x.JobsCount)
           .ToList();

            return result;
        }
    }
}