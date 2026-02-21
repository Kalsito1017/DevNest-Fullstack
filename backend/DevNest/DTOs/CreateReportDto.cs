using System.ComponentModel.DataAnnotations;

public class CreateReportDto
{
    [Required]
    [StringLength(50)]
    public string Reason { get; set; } = "";

    [Required]
    [StringLength(500, MinimumLength = 10)]
    public string Details { get; set; } = "";

    [EmailAddress]
    [StringLength(254)]
    public string? Email { get; set; }

    // много полезно да знаеш за коя обява е
    public int? JobId { get; set; }

    // по желание: от коя страница/URL
    [StringLength(500)]
    public string? PageUrl { get; set; }
}