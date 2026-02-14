using DevNest.Models.Jobs;

public class SavedJob
{
    public int Id { get; set; }

    public string UserId { get; set; } = null!;
    public int JobId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ApplicationUser User { get; set; } = null!;
    public Job Job { get; set; } = null!;
}
