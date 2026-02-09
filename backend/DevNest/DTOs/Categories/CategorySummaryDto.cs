namespace DevNest.DTOs.Categories
{
    public class CategorySummaryDto
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = "";
        public string CategorySlug { get; set; } = "";
        public string? IconUrl { get; set; }

        public int TotalJobs { get; set; }
        public int NewJobs { get; set; } // last 30 days
    }
}
