using System.ComponentModel.DataAnnotations;

public class UserSavedEvent
{
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = default!;

    public int EventId { get; set; }
    public Event Event { get; set; } = default!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
