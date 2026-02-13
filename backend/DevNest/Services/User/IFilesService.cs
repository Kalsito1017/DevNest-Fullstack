using DevNest.DTOs.User;

namespace DevNest.Services.User;

public interface IFilesService
{
    Task<IReadOnlyList<UserFileDto>> ListAsync(string userId, CancellationToken ct = default);
    Task<UserFileDto> UploadAsync(string userId, IFormFile file, CancellationToken ct = default);
    Task<(byte[] Bytes, string ContentType, string FileName)> DownloadAsync(string userId, int id, CancellationToken ct = default);
    Task DeleteAsync(string userId, int id, CancellationToken ct = default);
}
