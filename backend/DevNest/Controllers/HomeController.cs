using DevNest.Data;
using DevNest.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DevNest.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HomeController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<HomeController> _logger;

        public HomeController(ApplicationDbContext context, ILogger<HomeController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/job
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetJobs()
        {
            try
            {
                var jobs = await _context.Jobs.ToListAsync();
                return Ok(jobs);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ERROR: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // GET: api/job/by-location?location=Plovdiv 
        [HttpGet("by-location")]
        public async Task<IActionResult> GetJobsByLocation([FromQuery] string location)
        {
            try
            {
                var jobs = await _context.Jobs
                    .Where(j => j.Location.Contains(location))
                    .ToListAsync();

                return Ok(jobs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // GET: api/home/tech/{stack}
        [HttpGet("tech/{stack}")]
        public async Task<IActionResult> GetJobsByStack([FromRoute] string stack)
        {
            try
            {
                var jobs = await _context.JobTechs
                    .Where(jt => jt.Tech.ToLower() == stack.ToLower())
                    .Select(jt => jt.Job)  // navigation property from JobTech to Job
                    .ToListAsync();

                return Ok(jobs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
      
    }
}