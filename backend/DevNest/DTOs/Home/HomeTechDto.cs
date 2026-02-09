namespace DevNest.DTOs.Home
{
    public class HomeTechDto
    {
        public int TechId { get; set; }
        public string TechName { get; set; } = "";
        public string TechSlug { get; set; } = "";
        public string? LogoUrl { get; set; }

        public int JobsCount { get; set; }
    }
}
