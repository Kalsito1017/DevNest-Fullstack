using DevNest.DTOs.Jobs;

namespace DevNest.Services.Jobs;

public interface IJobAdsService
{
    Task<JobAdDetailsDto?> GetByIdAsync(int id, CancellationToken ct = default);
}

