namespace DevNest.DTOs.User;

public class UserFileDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public string ContentType { get; set; } = "application/octet-stream";
    public DateTime CreatedAt { get; set; }
}
