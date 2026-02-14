using DevNest.DTOs.Home;
using DevNest.Services.Home;
using Microsoft.AspNetCore.Mvc;

namespace DevNest.Controllers.Home
{
    [ApiController]
    [Route("api/[controller]")]
    public class HomeController : ControllerBase
    {
        private readonly ILogger<HomeController> logger;
        private readonly IHomeSectionsService homeSections;

        public HomeController(
            ILogger<HomeController> logger,
            IHomeSectionsService homeSections)
        {
            this.logger = logger;
            this.homeSections = homeSections;
        }

        [HttpGet]
        public async Task<IActionResult> Get(
        [FromQuery] int takeTechs = 6,
        [FromQuery] string? location = null,
        [FromQuery] bool remote = false,
        CancellationToken ct = default)
        {
            var items = await homeSections.GetSectionsAsync(takeTechs, location, remote, ct);
            return Ok(items);
        }

    }
}
