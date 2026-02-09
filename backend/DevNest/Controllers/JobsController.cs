using DevNest.DTOs.Jobs;
using DevNest.DTOs.Techs;
using DevNest.Services.Jobs;
using Microsoft.AspNetCore.Mvc;

namespace DevNest.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobsController : ControllerBase
{
    private readonly IJobSearchService searchService;
    private readonly IJobReadService readService;
    private readonly IJobStatsService statsService;

    public JobsController(IJobSearchService searchService, IJobReadService readService, IJobStatsService statsService)
    {
        this.searchService = searchService;
        this.readService = readService;
        this.statsService = statsService;
    }

    [HttpGet("search")]
    public async Task<ActionResult<PagedResult<JobCardDto>>> Search([FromQuery] JobSearchQuery query, CancellationToken ct)
        => Ok(await searchService.SearchAsync(query, ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<JobCardDto>> GetById(int id, CancellationToken ct)
    {
        var job = await readService.GetByIdAsync(id, ct);
        return job is null ? NotFound() : Ok(job);
    }

    [HttpGet("latest")]
    public async Task<ActionResult<IReadOnlyList<JobCardDto>>> Latest([FromQuery] int take = 10, CancellationToken ct = default)
        => Ok(await readService.GetLatestAsync(take, ct));

    [HttpGet("tech-stats")]
    public async Task<ActionResult<IReadOnlyList<TechStatDto>>> TechStats(
    [FromServices] IJobStatsService stats,
    CancellationToken ct)
    {
        return Ok(await stats.GetTechStatsAsync(ct));
    }
    [HttpGet("all")]
    public async Task<ActionResult<IReadOnlyList<JobCardDto>>> GetAll(CancellationToken ct)
    => Ok(await readService.GetAllAsync(ct));

    [HttpGet("facets")]
    public async Task<ActionResult<JobFacetsDto>> Facets([FromQuery] JobSearchQuery query, CancellationToken ct)
    => Ok(await searchService.GetFacetsAsync(query, ct));
    [HttpGet("count")]
    public async Task<IActionResult> GetCount(
    [FromQuery] string? location = null,
    [FromQuery] bool remote = false,
    CancellationToken ct = default)
    {
        var dto = await statsService.GetCountAsync(location, remote, ct);
        return Ok(dto);
    }


}
