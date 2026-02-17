using System.ComponentModel.DataAnnotations;

public class ContactEmailDto
{
    [Required, EmailAddress]
    public string Email { get; set; } = "";

    [Required, MaxLength(120)]
    public string Subject { get; set; } = "";

    [Required, MaxLength(4000)]
    public string Message { get; set; } = "";

    public string? Name { get; set; }
}