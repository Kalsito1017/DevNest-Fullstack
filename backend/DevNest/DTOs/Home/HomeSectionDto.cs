namespace DevNest.DTOs.Home
{
    public sealed class HomeSectionDto
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = "";
        public string CategorySlug { get; set; } = "";
        public string? IconUrl { get; set; }

        public int JobsCount { get; set; }
        public List<HomeTechDto> Techs { get; set; } = new();
    }
}
