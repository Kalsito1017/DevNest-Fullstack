namespace DevNest.Data.Models
{
    using System;
    using System.ComponentModel.DataAnnotations;

    using DevNest.Data.Common.Models;

    public class JobApplication : BaseDeletableModel<int>
    {
        [Required]
        [StringLength(200)]
        public string FullName { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(200)]
        public string Email { get; set; }

        [StringLength(20)]
        public string Phone { get; set; }

        [StringLength(500)]
        public string CoverLetter { get; set; }

        [StringLength(500)]
        public string ResumeUrl { get; set; }

        [StringLength(100)]
        public string LinkedInProfile { get; set; }

        [StringLength(100)]
        public string GitHubProfile { get; set; }

        [StringLength(100)]
        public string PortfolioUrl { get; set; }

        [StringLength(50)]
        public string Status { get; set; } // Applied, Under Review, Rejected, Accepted

        public DateTime AppliedDate { get; set; } = DateTime.UtcNow;

        public int JobsId { get; set; }

        public Jobs Job { get; set; }
    }
}
