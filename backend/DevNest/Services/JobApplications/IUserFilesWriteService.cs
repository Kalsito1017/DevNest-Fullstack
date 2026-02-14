using Microsoft.AspNetCore.Http;

namespace DevNest.Services.JobApplications;

public interface IUserFilesWriteService
{
    Task<int> SaveForUserAsync(string userId, IFormFile file, CancellationToken ct = default);
}