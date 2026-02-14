using DevNest.Models.Companies;
using DevNest.Models.Tech;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DevNest.Models.Jobs
{
    public class Job
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        public string Requirements { get; set; } = string.Empty;
        public string? Responsibilities { get; set; }
        public string? Benefits { get; set; }

        public string JobType { get; set; } = "Full-time"; // Full-time, Part-time, Contract, Internship, Remote
        public string ExperienceLevel { get; set; } = "Mid-level"; // Junior, Mid-level, Senior, Lead
        public string? SalaryRange { get; set; } 
        public string? Location { get; set; } // "Remote", "On-Site", "Hybrid", "Sofia, Bulgaria"
        public bool IsRemote { get; set; } = false;

        public string? RequiredSkills { get; set; } // Comma-separated
        public string? PreferredSkills { get; set; } // Comma-separated
        public string? TechStack { get; set; } // Comma-separated

        // Job status and metadata
        public string Status { get; set; } = "Active"; // Active, Closed, Draft, Expired
        public DateTime Deadline { get; set; } = DateTime.UtcNow.AddDays(30);
        public int Views { get; set; } = 0;
        public int Applications { get; set; } = 0;

        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? PublishedAt { get; set; }
        public DateTime? ClosedAt { get; set; }

        // Foreign keys
        public int CompanyId { get; set; }

       
        [ForeignKey("CompanyId")]
        public virtual Company Company { get; set; } = null!;

        public int CategoryId { get; set; }
        public Category Category { get; set; } = null!;

        public ICollection<JobTech> JobTechs { get; set; } = new List<JobTech>();


    }
}