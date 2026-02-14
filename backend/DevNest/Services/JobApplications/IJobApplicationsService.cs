using DevNest.DTOs.JobApplications;

namespace DevNest.Services.JobApplications;

public interface IJobApplicationsService
{
    Task<ApplyJobResponseDto> ApplyAsync(string userId, ApplyJobRequestDto dto, CancellationToken ct = default);

    Task<IReadOnlyList<MyJobApplicationListItemDto>> GetMineAsync(string userId, CancellationToken ct = default);
}