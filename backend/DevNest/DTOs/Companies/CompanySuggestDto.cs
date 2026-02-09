namespace DevNest.DTOs.Companies
{
    public sealed class CompanySuggestDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? LogoUrl { get; set; }
        public int JobsCount { get; set; }
    }
}
