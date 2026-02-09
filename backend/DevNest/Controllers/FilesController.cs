using DevNest.Services.Files;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[Authorize]
[ApiController]
[Route("api/files")]
public class FilesController : ControllerBase
{
    private readonly IFilesService files;

    public FilesController(IFilesService files)
    {
        this.files = files;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
        => Ok(await files.ListAsync(UserId, ct));

    // ✅ THIS is the missing one that causes 405
    [HttpPost]
    [RequestSizeLimit(25_000_000)]
    public async Task<IActionResult> Upload([FromForm] IFormFile file, CancellationToken ct)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });

        var created = await files.UploadAsync(UserId, file, ct);

        return Ok(new
        {
            created.Id,
            originalName = created.Name,
            created.ContentType,
            created.SizeBytes,
            created.CreatedAt
        });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        await files.DeleteAsync(UserId, id, ct);
        return NoContent();
    }

    [HttpGet("{id:int}/download")]
    public async Task<IActionResult> Download(int id, CancellationToken ct)
    {
        var (bytes, contentType, fileName) = await files.DownloadAsync(UserId, id, ct);
        return File(bytes, contentType, fileName);
    }
}
