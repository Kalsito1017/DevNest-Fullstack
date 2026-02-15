using System.ComponentModel.DataAnnotations;

public class RegisterDto
{
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
    [StringLength(100, MinimumLength = 6)]
    public string Password { get; set; } = "";

    // препоръчително (frontend почти винаги го има)
    [Required]
    [Compare(nameof(Password), ErrorMessage = "Passwords do not match.")]
    public string ConfirmPassword { get; set; } = "";
}