namespace DevNest.DTOs.Jobs
{
    public class JobCardDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;

        public string? Location { get; set; }
        public bool IsRemote { get; set; }
        public string JobType { get; set; } = string.Empty;
        public string ExperienceLevel { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
        public DateTime Deadline { get; set; }

        public int CompanyId { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string? CompanyLogoUrl { get; set; }

        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public string? CategorySlug { get; set; }

        public List<string> Techs { get; set; } = new();
    }
}
