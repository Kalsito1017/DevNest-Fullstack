using DevNest.DTOs.Jobs;

namespace DevNest.Services.Jobs;

public interface IJobHomeSectionsService
{
    Task<LocationJobsResponseDto> GetByLocationsAsync(int takePerLocation = 6, CancellationToken ct = default);
}
