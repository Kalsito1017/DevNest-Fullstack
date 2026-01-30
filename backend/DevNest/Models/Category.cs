namespace DevNest.Models
{
    public class Category
    {
        public int Id { get; set; }  
        public string Name { get; set; } = string.Empty; 
        public string? Slug { get; set; }  
        public string? Description { get; set; } 
        public string? IconUrl { get; set; }  

     
        public virtual ICollection<Job> Jobs { get; set; } = new List<Job>(); 

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
