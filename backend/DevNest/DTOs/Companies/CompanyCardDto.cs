namespace DevNest.DTOs.Companies
{
    public class CompanyCardDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string? LogoUrl { get; set; }

        public string? Location { get; set; }

        public string? Size { get; set; }

        public bool IsActive { get; set; }

        public string? TechStack { get; set; }
            
        public int JobsCount { get; set; }
    }
}
