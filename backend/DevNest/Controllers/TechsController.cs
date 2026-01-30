using DevNest.Services.Techs;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/techs")]
public class TechsController : ControllerBase
{
    private readonly ITechReadService techs;

    public TechsController(ITechReadService techs)
    {
        this.techs = techs;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(await techs.GetAllAsync(ct));

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken ct)
    {
        var tech = await techs.GetBySlugAsync(slug, ct);
        if (tech == null) return NotFound();
        return Ok(tech);
    }

}
