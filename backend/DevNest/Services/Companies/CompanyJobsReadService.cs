using DevNest.Data;
using DevNest.DTOs.Jobs;
using Microsoft.EntityFrameworkCore;

namespace DevNest.Services.Companies
{
    public class CompanyJobsReadService : ICompanyJobsReadService
    {
        private readonly ApplicationDbContext db;

        public CompanyJobsReadService(ApplicationDbContext db)
        {
            this.db = db;
        }

        public async Task<IReadOnlyList<JobCardDto>> GetJobsByCompanyIdAsync(
            int companyId,
            int page,
            int pageSize,
            CancellationToken ct = default)
        {
            page = page < 1 ? 1 : page;
            pageSize = pageSize is < 1 or > 100 ? 20 : pageSize;

            return await db.Jobs
                .AsNoTracking()
                .Where(j => j.CompanyId == companyId && j.Status == "Active")
                .Include(j => j.Company)
                .Include(j => j.Category)
                .Include(j => j.JobTechs) 
                .OrderByDescending(j => j.PublishedAt ?? j.CreatedAt)
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
                    CategoryName = j.Category.Name,
                    CategorySlug = j.Category.Slug,

               
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
}
