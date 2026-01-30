using DevNest.DTOs.Jobs;

namespace DevNest.Services.Jobs;

public interface IJobSearchService
{
    Task<PagedResult<JobCardDto>> SearchAsync(JobSearchQuery query, CancellationToken ct = default);
}
