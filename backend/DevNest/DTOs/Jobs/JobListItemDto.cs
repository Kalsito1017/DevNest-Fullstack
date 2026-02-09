namespace DevNest.DTOs.Jobs
{
    public sealed class JobListItemDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = "";
        public string Location { get; set; } = "";
        public bool IsRemote { get; set; }
        public string JobType { get; set; } = "";
        public string ExperienceLevel { get; set; } = "";
        public string SalaryRange { get; set; } = "";
        public DateTime PublishedAt { get; set; }

        public int CompanyId { get; set; }
        public string CompanyName { get; set; } = "";
        public string? CompanyLogoUrl { get; set; }

        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = "";
        public string CategorySlug { get; set; } = "";

        public List<string> TechSlugs { get; set; } = new();
    }
}
