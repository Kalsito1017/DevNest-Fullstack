using DevNest.DTOs.Jobs;

namespace DevNest.Services.Jobs
{
    public interface ISavedJobsService
    {
        Task<bool> ToggleAsync(string userId, int jobId, CancellationToken ct = default);
        Task<IReadOnlyList<JobCardDto>> GetMySavedAsync(string userId, CancellationToken ct = default);
    }
}
