using DevNest.DTOs.Companies;
using DevNest.DTOs.Jobs;
using DevNest.Services.Companies;
using Microsoft.AspNetCore.Mvc;

namespace DevNest.Controllers.Companies
{
    [ApiController]
    [Route("api/[controller]")]
    public class CompaniesController : ControllerBase
    {
        private readonly ICompanyReadService companies;
        private readonly ICompanyJobsReadService companyJobs;
        private readonly ICompanyProfileService profileService;

        public CompaniesController(ICompanyReadService companies, ICompanyJobsReadService companyJobs, ICompanyProfileService profileService)
        {
            this.companies = companies;
            this.companyJobs = companyJobs;
            this.profileService = profileService;
        }

        // LIST (no pagination)
        // GET /api/companies?search=endava&sort=alpha&onlyActive=true&sizeBucket=micro
        // GET /api/companies?search=endava&sort=alpha&onlyActive=true&sizeBucket=micro&location=sofia
        [HttpGet]
        public async Task<IActionResult> GetCompanies(
            [FromQuery] string? search,
            [FromQuery] string sort = "random",
            [FromQuery] bool onlyActive = true,
            [FromQuery] string? sizeBucket = null,
            [FromQuery] string? location = null,
            CancellationToken ct = default)
        {
            var (totalCount, items) = await companies.GetCompanyCardsAsync(
                search, sort, onlyActive, sizeBucket, location, ct);

            return Ok(new { totalCount, items });
        }


        // DETAILS
        // GET /api/companies/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<CompanyDetailsDto>> GetById(int id, CancellationToken ct = default)
        {
            var company = await companies.GetByIdAsync(id, ct);
            return company is null ? NotFound() : Ok(company);
        }

        // COMPANY JOBS (pagination is fine here)
        // GET /api/companies/5/jobs?page=1&pageSize=20
        [HttpGet("{id:int}/jobs")]
        public async Task<ActionResult<IReadOnlyList<JobCardDto>>> GetCompanyJobs(
            int id,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken ct = default)
        {
            var jobs = await companyJobs.GetJobsByCompanyIdAsync(id, page, pageSize, ct);
            return Ok(jobs);
        }

        // SIZE STATS for filter UI
        // GET /api/companies/size-stats?onlyActive=true
        [HttpGet("size-stats")]
        public async Task<IActionResult> GetSizeStats(
            [FromQuery] bool onlyActive = true,
            CancellationToken ct = default)
        {
            var stats = await companies.GetCompanySizeStatsAsync(onlyActive, ct);
            return Ok(stats);
        }

        // GET /api/companies/location-stats?onlyActive=true
        [HttpGet("location-stats")]
        public async Task<IActionResult> GetLocationStats(
            [FromQuery] bool onlyActive = true,
            CancellationToken ct = default)
        {
            var stats = await companies.GetCompanyLocationStatsAsync(onlyActive, ct);
            return Ok(stats);
        }

        // GET /api/companies/map?onlyActive=true
        [HttpGet("map")]
        public async Task<IActionResult> GetCompaniesMap(
            [FromQuery] bool onlyActive = true,
            CancellationToken ct = default)
        {
            var items = await companies.GetCompaniesForMapAsync(onlyActive, ct);
            return Ok(items);
        }

        [HttpGet("suggest")]
        public async Task<IActionResult> Suggest(
    [FromQuery] string? q,
    [FromQuery] int take = 8,
    [FromQuery] bool onlyActive = true,
    CancellationToken ct = default)
        {
            var items = await companies.SuggestAsync(q, take, onlyActive, ct);
            return Ok(items);
        }

        [HttpGet("{id:int}/profile")]
        public async Task<IActionResult> GetProfile(int id, CancellationToken ct)
        {
            var dto = await profileService.GetByIdAsync(id, ct);
            return dto == null ? NotFound() : Ok(dto);

        }

    }
}
