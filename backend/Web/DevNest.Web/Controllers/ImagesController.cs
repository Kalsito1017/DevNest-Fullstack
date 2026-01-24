// Controllers/Api/ImagesController.cs
namespace DevNest.Web.Controllers.Api
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;

    using DevNest.Data;
    using DevNest.Data.Models;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;

    [Route("api/[controller]")]
    [ApiController]
    public class ImagesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ImagesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/images
        [HttpGet]
        [AllowAnonymous] // If you want public access
        public async Task<ActionResult<IEnumerable<Image>>> GetImages()
        {
            // If using BaseDeletableModel, filter out deleted images
            var images = await _context.Images
                .Where(i => !i.IsDeleted) // Important if using soft delete
                .OrderByDescending(i => i.CreatedOn)
                .Select(i => new
                {
                    i.Id,
                    i.Url,
                    i.AltText,
                    i.CreatedOn
                })
                .ToListAsync();

            return Ok(images);
        }

        // GET: api/images/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Image>> GetImage(int id)
        {
            var image = await _context.Images
                .Where(i => i.Id == id && !i.IsDeleted)
                .Select(i => new
                {
                    i.Id,
                    i.Url,
                    i.AltText,
                    i.CreatedOn
                })
                .FirstOrDefaultAsync();

            if (image == null)
            {
                return NotFound();
            }

            return Ok(image);
        }
    }
}