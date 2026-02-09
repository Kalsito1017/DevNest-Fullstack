namespace DevNest.DTOs.Companies
{
    public sealed class CompanyMapDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? LogoUrl { get; set; }
        public string Location { get; set; } = string.Empty; // Sofia/Varna/...
        public int JobsCount { get; set; } // Active jobs
    }
}
