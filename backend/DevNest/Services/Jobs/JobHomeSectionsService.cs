using DevNest.Data;
using DevNest.DTOs.Jobs;
using DevNest.Models.Jobs;
using Microsoft.EntityFrameworkCore;

namespace DevNest.Services.Jobs;

public class JobHomeSectionsService : IJobHomeSectionsService
{
    private readonly ApplicationDbContext db;

    public JobHomeSectionsService(ApplicationDbContext db) => this.db = db;

    public async Task<LocationJobsResponseDto> GetByLocationsAsync(int takePerLocation = 6, CancellationToken ct = default)
    {
        takePerLocation = takePerLocation is < 1 or > 50 ? 6 : takePerLocation;

        var sections = new (string Key, string Title, Func<IQueryable<Job>, IQueryable<Job>> Filter)[]
        {
            ("Sofia", "Sofia", q => q.Where(j => j.Location != null && j.Location.Contains("Sofia"))),
            ("Plovdiv", "Plovdiv", q => q.Where(j => j.Location != null && j.Location.Contains("Plovdiv"))),
            ("Varna", "Varna", q => q.Where(j => j.Location != null && j.Location.Contains("Varna"))),
            ("Burgas", "Burgas", q => q.Where(j => j.Location != null && j.Location.Contains("Burgas"))),
            ("Ruse", "Ruse", q => q.Where(j => j.Location != null && j.Location.Contains("Ruse"))),
            ("Remote", "Remote", q => q.Where(j => j.IsRemote || (j.Location != null && j.Location.Contains("Remote")))),
        };

        IQueryable<Job> baseQuery = db.Jobs
            .AsNoTracking()
            .Where(j => j.Status == "Active")
            .Include(j => j.Company)
            .Include(j => j.JobTechs); 

        var categoryMap = await db.Categories
            .AsNoTracking()
            .ToDictionaryAsync(c => c.Id, c => new { c.Name, c.Slug }, ct);

        async Task<List<JobCardDto>> LoadAsync(Func<IQueryable<Job>, IQueryable<Job>> filter)
        {
            return await filter(baseQuery)
                .OrderByDescending(j => j.CreatedAt)
                .Take(takePerLocation)
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
                          .ToList(),
                })
                .ToListAsync(ct);
        }

        var result = new List<LocationJobsSectionDto>();

        foreach (var s in sections)
        {
            result.Add(new LocationJobsSectionDto
            {
                Key = s.Key,
                Title = s.Title,
                Jobs = await LoadAsync(s.Filter)
            });
        }

        return new LocationJobsResponseDto { Sections = result };
    }
}
