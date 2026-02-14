using DevNest.Services.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[Authorize]
[ApiController]
[Route("api/saved-jobs")]
public class SavedJobsController : ControllerBase
{
    private readonly ISavedJobsService service;

    public SavedJobsController(ISavedJobsService service)
    {
        this.service = service;
    }

    [HttpPost("{jobId:int}")]
    public async Task<IActionResult> Toggle(int jobId, CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var saved = await service.ToggleAsync(userId, jobId, ct);
        return Ok(new { saved });
    }

    [HttpGet]
    public async Task<IActionResult> MySaved(CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var jobs = await service.GetMySavedAsync(userId, ct);
        return Ok(jobs);
    }

}
