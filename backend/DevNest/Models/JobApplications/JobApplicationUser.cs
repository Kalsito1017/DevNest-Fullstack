using DevNest.Models.JobApplications;

namespace DevNest.Models.JobApplications
{
    public class JobApplicationUser
    {
        public int Id { get; set; }

        public int JobApplicationId { get; set; }
        public JobApplication JobApplication { get; set; } = null!;

        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string Email { get; set; } = "";

        public string MotivationLetter { get; set; } = "";
    }
}
