namespace DevNest.DTOs.Techs
{
    public class TechCardDto
    {
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? LogoUrl { get; set; }
        public int JobsCount { get; set; }
    }
}
