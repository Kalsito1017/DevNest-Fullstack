namespace DevNest.Models
{
    public class Tech
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;   // React
        public string Slug { get; set; } = string.Empty;   // react
        public bool IsActive { get; set; } = true;

        // FK to Image
        public string? LogoUrl { get; set; }

        public ICollection<JobTech> JobTechs { get; set; } = new List<JobTech>();
    }
}
