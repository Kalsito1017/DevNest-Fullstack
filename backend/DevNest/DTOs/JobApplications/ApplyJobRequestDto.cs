using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace DevNest.DTOs.JobApplications;

public class ApplyJobRequestDto
{
    [Required]
    [Range(1, int.MaxValue)]
    public int JobId { get; set; }

    [Required]
    [StringLength(50, MinimumLength = 2)]
    public string FirstName { get; set; } = "";

    [Required]
    [StringLength(50, MinimumLength = 2)]
    public string LastName { get; set; } = "";

    [Required]
    [EmailAddress]
    [StringLength(254)]
    public string Email { get; set; } = "";

    [Required]
    [StringLength(4000, MinimumLength = 20)]
    public string MotivationLetter { get; set; } = "";

    // Optional uploads
    public List<IFormFile>? NewFiles { get; set; }

    // Optional existing attachments
    public List<int>? ExistingUserFileIds { get; set; }
}