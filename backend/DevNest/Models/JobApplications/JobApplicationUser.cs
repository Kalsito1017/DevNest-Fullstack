using System.ComponentModel.DataAnnotations;

namespace DevNest.Models.JobApplications
{
    public class JobApplicationUser
    {
        public int Id { get; set; }

        [Required]
        public int JobApplicationId { get; set; }

        public JobApplication JobApplication { get; set; } = null!;

        [Required]
        [StringLength(50, MinimumLength = 2)]
        public string FirstName { get; set; } = "";

        [Required]
        [StringLength(50, MinimumLength = 2)]
        public string LastName { get; set; } = "";

        [Required]
        [EmailAddress]
        [StringLength(254)] // safe upper bound commonly used for emails
        public string Email { get; set; } = "";

        [Required]
        [StringLength(4000, MinimumLength = 20)]
        public string MotivationLetter { get; set; } = "";
    }
}