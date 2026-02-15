using DevNest.Data;
using DevNest.DTOs.Categories;
using Microsoft.EntityFrameworkCore;

namespace DevNest.Services.Categories
{
    public class CategoryReadService : ICategoryReadService
    {
        private readonly ApplicationDbContext db;

        public CategoryReadService(ApplicationDbContext db) => this.db = db;

        public async Task<IReadOnlyList<CategoryListDto>> GetAllAsync(CancellationToken ct = default)
        {
            return await db.Categories
                .AsNoTracking()
                .OrderBy(c => c.Name)
                .Select(c => new CategoryListDto
                {
                    Id = c.Id,
                    Name = c.Name ?? "",
                    Slug = c.Slug ?? "",
                    Description = c.Description,
                    IconUrl = c.IconUrl
                })
                .ToListAsync(ct);
        }
        public async Task<CategoryDetailsDto?> GetBySlugAsync(string slug, CancellationToken ct = default)
        {
            slug = (slug ?? string.Empty).Trim().ToLower();

            return await db.Categories
                .AsNoTracking()
               .Where(c => c.Slug != null && c.Slug.ToLower() == slug)
                .Select(c => new CategoryDetailsDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Slug = c.Slug ?? "",
                    Description = c.Description,
                    IconUrl = c.IconUrl
                })
                .FirstOrDefaultAsync(ct);
        }

        public async Task<CategorySummaryDto?> GetSummaryAsync(string slug, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(slug)) return null;
            slug = slug.Trim();

            var category = await db.Categories
                .AsNoTracking()
                .Where(c => c.Slug == slug)
                .Select(c => new { c.Id, c.Name, c.Slug, c.IconUrl })
                .FirstOrDefaultAsync(ct);

            if (category is null) return null;

            var visibleStatuses = new[] { "Active", "Open", "Published" };

            var baseJobs = db.Jobs
                .AsNoTracking()
                .Where(j => j.CategoryId == category.Id)
                .Where(j => visibleStatuses.Contains(j.Status));

            var totalJobs = await baseJobs.CountAsync(ct);

            var since = DateTime.UtcNow.AddDays(-30);
            var newJobs = await baseJobs
                .Where(j => (j.PublishedAt ?? j.CreatedAt) >= since)
                .CountAsync(ct);

            return new CategorySummaryDto
            {
                CategoryId = category.Id,
                CategoryName = category.Name ?? "",
                CategorySlug = category.Slug ?? "",
                IconUrl = category.IconUrl,
                TotalJobs = totalJobs,
                NewJobs = newJobs
            };
        }
    }
}
