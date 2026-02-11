using DevNest.Services.Jobs;
using Microsoft.AspNetCore.Mvc;

namespace DevNest.Controllers;

[ApiController]
[Route("api/jobads")]
public class JobAdsController : ControllerBase
{
    private readonly IJobAdsService jobAds;

    public JobAdsController(IJobAdsService jobAds) => this.jobAds = jobAds;

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var dto = await jobAds.GetByIdAsync(id, ct);
        return dto == null ? NotFound() : Ok(dto);
    }
}
