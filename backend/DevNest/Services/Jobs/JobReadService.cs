using DevNest.Data;
using DevNest.DTOs.Jobs;
using Microsoft.EntityFrameworkCore;

namespace DevNest.Services.Jobs;

public class JobReadService : IJobReadService
{
    private readonly ApplicationDbContext db;

    public JobReadService(ApplicationDbContext db) => this.db = db;

    public async Task<IReadOnlyList<JobCardDto>> GetAllAsync(CancellationToken ct = default)
    {
        var categoryMap = await db.Categories
            .AsNoTracking()
            .ToDictionaryAsync(c => c.Id, c => new { c.Name, c.Slug }, ct);

        return await db.Jobs
            .AsNoTracking()
            .Where(j => j.Status == "Active")
            .Include(j => j.Company)
            .Include(j => j.JobTechs) // ✅ we only need TechId from JobTechs
            .OrderByDescending(j => j.CreatedAt)
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
                CategoryName = categoryMap.ContainsKey(j.CategoryId) ? categoryMap[j.CategoryId].Name : null,
                CategorySlug = categoryMap.ContainsKey(j.CategoryId) ? categoryMap[j.CategoryId].Slug : null,

                // ✅ Tech icons via JOIN (because jt.Tech is string in your model)
                Techs = j.JobTechs == null
                    ? new List<TechIconDto>()
                    : (
                        from jt in j.JobTechs
                        where jt.TechId.HasValue
                        join t in db.Techs.AsNoTracking() on jt.TechId!.Value equals t.Id
                        select new TechIconDto
                        {
                            Id = t.Id,
                            Name = t.Name,
                            Slug = t.Slug,
                            LogoUrl = t.LogoUrl
                        }
                      )
                      .GroupBy(x => x.Id)
                      .Select(g => g.First())
                      .ToList()
            })
            .ToListAsync(ct);
    }

    public async Task<JobCardDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var categoryMap = await db.Categories
            .AsNoTracking()
            .ToDictionaryAsync(c => c.Id, c => new { c.Name, c.Slug }, ct);

        return await db.Jobs
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
                Status = j.Status,
                CreatedAt = j.CreatedAt,
                Deadline = j.Deadline,

                CompanyId = j.CompanyId,
                CompanyName = j.Company.Name,
                CompanyLogoUrl = j.Company.LogoUrl,

                CategoryId = j.CategoryId,
                CategoryName = categoryMap.ContainsKey(j.CategoryId) ? categoryMap[j.CategoryId].Name : null,
                CategorySlug = categoryMap.ContainsKey(j.CategoryId) ? categoryMap[j.CategoryId].Slug : null,

                Techs = j.JobTechs == null
                    ? new List<TechIconDto>()
                    : (
                        from jt in j.JobTechs
                        where jt.TechId.HasValue
                        join t in db.Techs.AsNoTracking() on jt.TechId!.Value equals t.Id
                        select new TechIconDto
                        {
                            Id = t.Id,
                            Name = t.Name,
                            Slug = t.Slug,
                            LogoUrl = t.LogoUrl
                        }
                      )
                      .GroupBy(x => x.Id)
                      .Select(g => g.First())
                      .ToList()
            })
            .FirstOrDefaultAsync(ct);
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
                Status = j.Status,
                CreatedAt = j.CreatedAt,
                Deadline = j.Deadline,

                CompanyId = j.CompanyId,
                CompanyName = j.Company.Name,
                CompanyLogoUrl = j.Company.LogoUrl,

                CategoryId = j.CategoryId,
                CategoryName = categoryMap.ContainsKey(j.CategoryId) ? categoryMap[j.CategoryId].Name : null,
                CategorySlug = categoryMap.ContainsKey(j.CategoryId) ? categoryMap[j.CategoryId].Slug : null,

                Techs = j.JobTechs == null
                    ? new List<TechIconDto>()
                    : (
                        from jt in j.JobTechs
                        where jt.TechId.HasValue
                        join t in db.Techs.AsNoTracking() on jt.TechId!.Value equals t.Id
                        select new TechIconDto
                        {
                            Id = t.Id,
                            Name = t.Name,
                            Slug = t.Slug,
                            LogoUrl = t.LogoUrl
                        }
                      )
                      .GroupBy(x => x.Id)
                      .Select(g => g.First())
                      .ToList()
            })
            .ToListAsync(ct);
    }
}
