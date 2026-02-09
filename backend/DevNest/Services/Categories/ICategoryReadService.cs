using DevNest.DTOs.Categories;
using DevNest.Services.Companies.DTOs;

namespace DevNest.Services.Categories
{
    public interface ICategoryReadService
    {
        Task<IReadOnlyList<CategoryListDto>> GetAllAsync(CancellationToken ct = default);
        Task<CategoryDetailsDto?> GetBySlugAsync(string slug, CancellationToken ct = default);

        Task<CategorySummaryDto?> GetSummaryAsync(string slug, CancellationToken ct = default);
    }
}
