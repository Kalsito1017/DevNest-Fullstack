using DevNest.DTOs.Techs;

namespace DevNest.Services.Jobs
{
    public interface IJobStatsService
    {
        Task<IReadOnlyList<TechStatDto>> GetTechStatsAsync(CancellationToken ct = default);
        Task<JobsCountDto> GetCountAsync(string? location, bool remote, CancellationToken ct = default);
    }
}

