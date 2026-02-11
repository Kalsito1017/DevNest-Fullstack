using DevNest.Data;
using DevNest.DTOs.Categories;
using DevNest.DTOs.Companies;
using DevNest.DTOs.Jobs;
using Microsoft.EntityFrameworkCore;

namespace DevNest.Services.Jobs;

public class JobAdsService : IJobAdsService
{
    private readonly ApplicationDbContext db;
    public JobAdsService(ApplicationDbContext db) => this.db = db;

    public async Task<JobAdDetailsDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        if (id <= 0) return null;

        var visibleStatuses = new[] { "Active", "Open", "Published" };

        var job = await db.Jobs
            .AsNoTracking()
            .Where(j => visibleStatuses.Contains(j.Status))
            .Include(j => j.Company)
            .Include(j => j.JobTechs)     // ✅ само това, без ThenInclude
            .Include(j => j.Category)
            .FirstOrDefaultAsync(j => j.Id == id, ct);

        if (job == null) return null;

        var categories = new List<CategoryPillDto>();
        if (job.Category != null)
        {
            categories.Add(new CategoryPillDto
            {
                Id = job.Category.Id,
                Name = job.Category.Name,
                Slug = job.Category.Slug,
                Count = null
            });
        }
        var techNames = job.JobTechs
    .Where(jt => !string.IsNullOrWhiteSpace(jt.Tech))
    .Select(jt => jt.Tech!.Trim())
    .Distinct()
    .ToList();
        var allTechs = await db.Techs
    .AsNoTracking()
    .Select(t => new { t.Id, t.Name, t.Slug, t.LogoUrl })
    .ToListAsync(ct);

        var techByName = allTechs
    .GroupBy(t => Norm(t.Name))
    .ToDictionary(g => g.Key, g => g.First());

        // ✅ jt.Tech е string -> правим уникален списък по текст
        var techStack = techNames
      .Select(name =>
      {
          var key = Norm(name);
          if (techByName.TryGetValue(key, out var t))
          {
              return new TechIconDto
              {
                  Id = t.Id,
                  Name = t.Name,
                  Slug = t.Slug ?? "",
                  LogoUrl = t.LogoUrl
              };
          }

          // fallback: unknown tech name (still show initials)
          return new TechIconDto
          {
              Id = 0,
              Name = name,
              Slug = "",
              LogoUrl = null
          };
      })
      .ToList();

        var company = job.Company;

        return new JobAdDetailsDto
        {
            Id = job.Id,
            Title = job.Title,
            Slug = "",

            Location = job.Location,
            IsRemote = job.IsRemote,
            JobType = job.JobType,
            ExperienceLevel = job.ExperienceLevel,
            CreatedAt = job.CreatedAt,

            Company = new CompanyMiniDto
            {
                Id = company.Id,
                Name = company.Name,
                Slug = "",
                LogoUrl = company.LogoUrl,
                Location = company.Location,
                Website = company.Website
            },

            Categories = categories,
            TechStack = techStack,

            CompanyAbout = company.Description,
            Description = job.Description
        };
        static string Norm(string s) =>
    new string((s ?? "").Trim().ToLowerInvariant().Where(ch => !char.IsWhiteSpace(ch)).ToArray());
    }
}
