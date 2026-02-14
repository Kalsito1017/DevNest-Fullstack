using DevNest.DTOs.Categories;
using DevNest.Services.Categories;
using Microsoft.AspNetCore.Mvc;

namespace DevNest.Controllers.Taxonomy
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryReadService categoryRead;


        public CategoriesController(ICategoryReadService categoryRead)
        {
            this.categoryRead = categoryRead;
        }

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<CategoryListDto>>> GetAll(CancellationToken ct)
            => Ok(await categoryRead.GetAllAsync(ct));

        [HttpGet("{slug}")]
        public async Task<ActionResult<CategoryDetailsDto>> GetBySlug(string slug, CancellationToken ct)
        {
            var category = await categoryRead.GetBySlugAsync(slug, ct);
            return category is null ? NotFound() : Ok(category);
        }
        [HttpGet("{slug}/summary")]
        public async Task<ActionResult<CategorySummaryDto>> GetSummary(string slug, CancellationToken ct)
        {
            var dto = await categoryRead.GetSummaryAsync(slug, ct);
            return dto is null ? NotFound() : Ok(dto);
        }
    }
}
