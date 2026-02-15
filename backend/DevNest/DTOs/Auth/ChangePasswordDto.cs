using System.ComponentModel.DataAnnotations;

public class ChangePasswordDto
{
    [Required]
    [StringLength(100, MinimumLength = 6)]
    public string CurrentPassword { get; set; } = "";

    [Required]
    [StringLength(100, MinimumLength = 6)]
    public string NewPassword { get; set; } = "";
}