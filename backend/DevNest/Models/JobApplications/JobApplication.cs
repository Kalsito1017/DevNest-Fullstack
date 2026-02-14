using DevNest.Models.Jobs;

namespace DevNest.Models.JobApplications
{
    public class JobApplication
    {
        public int Id { get; set; }

        public int JobId { get; set; }
        public Job Job { get; set; } = null!;

        public string UserId { get; set; } = null!;
        public ApplicationUser User { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public JobApplicationUser Applicant { get; set; } = null!;

        public ICollection<JobApplicationFile> Files { get; set; } = new List<JobApplicationFile>();
    }
}
