namespace DevNest.DTOs.Jobs
{
    public class JobSearchQuery
    {
        public string? Q { get; set; }
        public string? CategorySlug { get; set; }
        public string? Tech { get; set; }
        public string? Location { get; set; }
        public bool? Remote { get; set; }
        public string? ExperienceLevel { get; set; } // Junior/Mid-level/Senior/Lead
        public string? JobType { get; set; } // Full-time/Part-time/Contract/Internship
        public string Sort { get; set; } = "newest"; // newest, deadline

        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}
