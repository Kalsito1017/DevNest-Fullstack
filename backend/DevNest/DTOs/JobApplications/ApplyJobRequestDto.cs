
namespace DevNest.DTOs.JobApplications;

public class ApplyJobRequestDto
{
    public int JobId { get; set; }

    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Email { get; set; } = "";
    public string MotivationLetter { get; set; } = "";

    // Upload new files (optional)
    public List<IFormFile>? NewFiles { get; set; }

    // Attach from "My Files" (optional)
    public List<int>? ExistingUserFileIds { get; set; }
}