using DevNest.Data;
using DevNest.DTOs.Techs;
using Microsoft.EntityFrameworkCore;

namespace DevNest.Services.Techs
{
    public class TechReadService : ITechReadService
    {
        private readonly ApplicationDbContext db;

        public TechReadService(ApplicationDbContext db)
        {
            this.db = db;
        }

        public async Task<IReadOnlyList<TechCardDto>> GetAllAsync(CancellationToken ct = default)
        {
            return await db.Techs
                .AsNoTracking()
                .Where(t => t.IsActive)
                .OrderBy(t => t.Name)
                .Select(t => new TechCardDto
                {
                    Name = t.Name,
                    Slug = t.Slug,
                    LogoUrl = t.LogoUrl,          
                    JobsCount = t.JobTechs.Count, 
                })
                .ToListAsync(ct);
        }

        public async Task<TechCardDto?> GetBySlugAsync(string slug, CancellationToken ct = default)
        {
            return await db.Techs
                .AsNoTracking()
                .Where(t => t.IsActive && t.Slug == slug)
                .Select(t => new TechCardDto
                {
                    Name = t.Name,
                    Slug = t.Slug,
                    LogoUrl = t.LogoUrl,       
                    JobsCount = t.JobTechs.Count,
                })
                .FirstOrDefaultAsync(ct);
        }
    }
}
