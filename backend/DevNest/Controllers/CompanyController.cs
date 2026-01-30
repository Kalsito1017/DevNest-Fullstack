using DevNest.Data;
using DevNest.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DevNest.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompanyController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CompanyController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/company
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Company>>> GetCompanies()
        {
            try
            {
                // Log to console
                Console.WriteLine("🔍 Getting companies from database...");

                // Get all active companies
                var companies = await _context.Companies
                    .Where(c => c.IsActive)
                    .OrderBy(c => c.Name)
                    .ToListAsync();

                Console.WriteLine($"✅ Found {companies.Count} companies");

                // Return as JSON
                return Ok(companies);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ERROR: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // GET: api/company/test
        [HttpGet("test")]
        public IActionResult Test()
        {
            Console.WriteLine("✅ Test endpoint called");
            return Ok(new
            {
                message = "Company API is working!",
                time = DateTime.Now,
                count = _context.Companies.Count()
            });
        }
    }
}