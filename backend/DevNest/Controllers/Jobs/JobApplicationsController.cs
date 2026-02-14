using System.Security.Claims;
using DevNest.DTOs.JobApplications;
using DevNest.Services.JobApplications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DevNest.Controllers.Jobs;

[Authorize]
[ApiController]
[Route("api/applications")]
public class JobApplicationsController : ControllerBase
{
    private readonly IJobApplicationsService svc;

    public JobApplicationsController(IJobApplicationsService svc)
    {
        this.svc = svc;
    }

    [HttpPost]
    [RequestSizeLimit(30_000_000)] // adjust if you want total bigger than 10MB
    public async Task<ActionResult<ApplyJobResponseDto>> Apply([FromForm] ApplyJobRequestDto dto, CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        try
        {
            var res = await svc.ApplyAsync(userId, dto, ct);
            return Ok(res);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("me")]
    public async Task<ActionResult<IReadOnlyList<MyJobApplicationListItemDto>>> Mine(CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var items = await svc.GetMineAsync(userId, ct);
        return Ok(items);
    }
}