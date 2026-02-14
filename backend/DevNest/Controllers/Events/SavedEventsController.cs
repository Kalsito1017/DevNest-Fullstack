using DevNest.Services.Events;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[Authorize]
[ApiController]
[Route("api/saved-events")]
public class SavedEventsController : ControllerBase
{
    private readonly ISavedEventsService service;

    public SavedEventsController(ISavedEventsService service)
    {
        this.service = service;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    // Toggle save/unsave
    [HttpPost("{eventId:int}")]
    public async Task<IActionResult> Toggle(int eventId, CancellationToken ct)
    {
        var saved = await service.ToggleAsync(UserId, eventId, ct);
        return Ok(new { saved });
    }

    // List my saved events
    [HttpGet]
    public async Task<IActionResult> MySaved(CancellationToken ct)
        => Ok(await service.GetMySavedAsync(UserId, ct));

    // Optional: check state
    [HttpGet("{eventId:int}/is-saved")]
    public async Task<IActionResult> IsSaved(int eventId, CancellationToken ct)
        => Ok(new { saved = await service.IsSavedAsync(UserId, eventId, ct) });
}