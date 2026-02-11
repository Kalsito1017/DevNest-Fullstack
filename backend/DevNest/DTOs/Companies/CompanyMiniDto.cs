namespace DevNest.DTOs.Companies
{
    public class CompanyMiniDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Slug { get; set; } = "";
        public string? LogoUrl { get; set; }
        public string? Location { get; set; }
        public string? Website { get; set; }
    }
}
