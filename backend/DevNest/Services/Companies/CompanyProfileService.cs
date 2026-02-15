using DevNest.Data;
using DevNest.DTOs.Companies;
using Microsoft.EntityFrameworkCore;

namespace DevNest.Services.Companies;

public class CompanyProfileService : ICompanyProfileService
{
    private readonly ApplicationDbContext db;

    // Visible statuses (match your project)
    private static readonly string[] VisibleStatuses = { "Active", "Open", "Published" };

    public CompanyProfileService(ApplicationDbContext db) => this.db = db;

    public async Task<CompanyProfileDto?> GetByIdAsync(int companyId, CancellationToken ct = default)
    {
        if (companyId <= 0) return null;

        return await db.Companies
            .AsNoTracking()
            .Where(x => x.Id == companyId)
            .Select(x => new CompanyProfileDto
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,

                Website = x.Website,
                Email = x.Email,
                Phone = x.Phone,

                LogoUrl = x.LogoUrl,
                Location = x.Location,
                Size = x.Size,
                IsActive = x.IsActive,

                TechStack = x.TechStack,

                LinkedInUrl = x.LinkedInUrl,
                TwitterUrl = x.TwitterUrl,
                GitHubUrl = x.GitHubUrl,

                JobsCount = x.Jobs.Count(j => VisibleStatuses.Contains(j.Status)),

                Jobs = x.Jobs
                    .Where(j => VisibleStatuses.Contains(j.Status))
                    .OrderByDescending(j => j.CreatedAt)
                    .Take(20)
                    .Select(j => new CompanyJobMiniDto
                    {
                        Id = j.Id,
                        Title = j.Title,
                        Location = j.Location,
                        IsRemote = j.IsRemote,
                        CreatedAt = j.CreatedAt
                    })
                    .ToList()
            })
            .FirstOrDefaultAsync(ct);
    }

  
    public Task<CompanyProfileDto?> GetBySlugAsync(string slug, CancellationToken ct = default)
    {
        return Task.FromResult<CompanyProfileDto?>(null);
    }
}
