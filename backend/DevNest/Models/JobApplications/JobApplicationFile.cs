using DevNest.Models.Files;

namespace DevNest.Models.JobApplications
{
    public class JobApplicationFile
    {
        public int Id { get; set; }

        public int JobApplicationId { get; set; }
        public JobApplication JobApplication { get; set; } = null!;

        public int UserFileId { get; set; }
        public UserFile UserFile { get; set; } = null!;
    }

}
