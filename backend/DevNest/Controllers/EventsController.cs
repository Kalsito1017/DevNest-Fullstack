using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/events")]
public class EventsController : ControllerBase
{
    private readonly IEventsService _eventsService;

    public EventsController(IEventsService eventsService)
    {
        _eventsService = eventsService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await _eventsService.GetAllAsync(ct);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var evt = await _eventsService.GetByIdAsync(id, ct);
        return evt == null ? NotFound() : Ok(evt);
    }
}
