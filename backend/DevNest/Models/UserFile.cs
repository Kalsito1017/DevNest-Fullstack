namespace DevNest.Models;

public class UserFile
{
    public int Id { get; set; }
    public string UserId { get; set; } = null!;
    public ApplicationUser User { get; set; } = null!;

    public string OriginalName { get; set; } = null!;
    public string StoredName { get; set; } = null!;
    public string ContentType { get; set; } = "application/octet-stream";
    public long SizeBytes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
