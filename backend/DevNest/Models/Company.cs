namespace DevNest.Models
{
    public class Company
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Website { get; set; }
        public string? Email { get; set;     }
        public string? Phone { get; set; }
        public string? LogoUrl { get; set; }
        public string? Location { get; set; }
        public  string? Size { get; set; } 
        public bool IsActive { get; set; } = true;

        public string? TechStack { get; set; } 

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Social links
        public string? LinkedInUrl { get; set; }
        public string? TwitterUrl { get; set; }
        public string? GitHubUrl { get; set; }

 
        public virtual ICollection<Job> Jobs { get; set; } = new List<Job>();

    }
}
