using DevNest.DTOs.Jobs;

namespace DevNest.Services.Companies
{
    public interface ICompanyJobsReadService
    {
        Task<IReadOnlyList<JobCardDto>> GetJobsByCompanyIdAsync(
            int companyId,
            int page,
            int pageSize,
            CancellationToken ct = default);
    }
}
