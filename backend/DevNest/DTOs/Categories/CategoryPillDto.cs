namespace DevNest.DTOs.Categories
{
    public class CategoryPillDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Slug { get; set; } = "";
        public int? Count { get; set; } // optional (if you want dev.bg style “123”)
    }
}
