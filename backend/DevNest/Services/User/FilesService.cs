using DevNest.Data;
using DevNest.Models;
using Microsoft.EntityFrameworkCore;
using DevNest.DTOs.User;

namespace DevNest.Services.User;

public class FilesService : IFilesService
{
    private readonly ApplicationDbContext db;
    private readonly IWebHostEnvironment env;

    private static readonly HashSet<string> AllowedExt = new(StringComparer.OrdinalIgnoreCase)
    { ".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx", ".ppt", ".pptx" };

    private const long MaxSizeBytes = 10 * 1024 * 1024; // 10MB

    public FilesService(ApplicationDbContext db, IWebHostEnvironment env)
    {
        this.db = db;
        this.env = env;
    }

    public async Task<IReadOnlyList<UserFileDto>> ListAsync(string userId, CancellationToken ct = default)
    {
        return await db.UserFiles.AsNoTracking()
            .Where(f => f.UserId == userId)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new UserFileDto
            {
                Id = f.Id,
                Name = f.OriginalName,
                SizeBytes = f.SizeBytes,
                ContentType = f.ContentType,
                CreatedAt = f.CreatedAt
            })
            .ToListAsync(ct);
    }

    public async Task<UserFileDto> UploadAsync(string userId, IFormFile file, CancellationToken ct = default)
    {
        if (file == null || file.Length == 0)
            throw new InvalidOperationException("Файлът е празен.");

        if (file.Length > MaxSizeBytes)
            throw new InvalidOperationException("Файлът е твърде голям.");

        var ext = Path.GetExtension(file.FileName);
        if (!AllowedExt.Contains(ext))
            throw new InvalidOperationException("Неподдържан формат.");

        var folder = Path.Combine(env.ContentRootPath, "uploads", userId);
        Directory.CreateDirectory(folder);

        var storedName = $"{Guid.NewGuid():N}{ext}";
        var fullPath = Path.Combine(folder, storedName);

        await using (var stream = File.Create(fullPath))
            await file.CopyToAsync(stream, ct);

        var entity = new UserFile
        {
            UserId = userId,
            OriginalName = file.FileName,
            StoredName = storedName,
            ContentType = string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType,
            SizeBytes = file.Length
        };

        db.UserFiles.Add(entity);
        await db.SaveChangesAsync(ct);

        return new UserFileDto
        {
            Id = entity.Id,
            Name = entity.OriginalName,
            SizeBytes = entity.SizeBytes,
            ContentType = entity.ContentType,
            CreatedAt = entity.CreatedAt
        };
    }

    public async Task<(byte[] Bytes, string ContentType, string FileName)> DownloadAsync(string userId, int id, CancellationToken ct = default)
    {
        var f = await db.UserFiles.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId, ct);
        if (f == null) throw new KeyNotFoundException("File not found.");

        var path = Path.Combine(env.ContentRootPath, "uploads", userId, f.StoredName);
        if (!File.Exists(path)) throw new KeyNotFoundException("File not found on disk.");

        var bytes = await File.ReadAllBytesAsync(path, ct);
        return (bytes, f.ContentType, f.OriginalName);
    }

    public async Task DeleteAsync(string userId, int id, CancellationToken ct = default)
    {
        var f = await db.UserFiles.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId, ct);
        if (f == null) throw new KeyNotFoundException("File not found.");

        var path = Path.Combine(env.ContentRootPath, "uploads", userId, f.StoredName);
        if (File.Exists(path)) File.Delete(path);

        db.UserFiles.Remove(f);
        await db.SaveChangesAsync(ct);
    }
}
