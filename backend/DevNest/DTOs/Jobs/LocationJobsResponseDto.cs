namespace DevNest.DTOs.Jobs
{
    public class LocationJobsResponseDto
    {
        public IReadOnlyList<LocationJobsSectionDto> Sections { get; set; } = Array.Empty<LocationJobsSectionDto>();
    }
}

    