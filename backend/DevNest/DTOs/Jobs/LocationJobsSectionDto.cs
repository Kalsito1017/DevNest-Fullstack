namespace DevNest.DTOs.Jobs
{
    public class LocationJobsSectionDto
    {
        public string Key { get; set; } = string.Empty;   // "Sofia", "Remote"
        public string Title { get; set; } = string.Empty; // "Sofia"
        public IReadOnlyList<JobCardDto> Jobs { get; set; } = Array.Empty<JobCardDto>();
    }
}
