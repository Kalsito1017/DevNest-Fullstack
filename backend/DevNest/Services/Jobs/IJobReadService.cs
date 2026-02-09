using DevNest.DTOs.Jobs;

namespace DevNest.Services.Jobs;

public interface IJobReadService
{
    Task<JobCardDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<JobCardDto>> GetLatestAsync(int take = 10, CancellationToken ct = default);

    Task<IReadOnlyList<JobCardDto>> GetAllAsync(CancellationToken ct);
}
