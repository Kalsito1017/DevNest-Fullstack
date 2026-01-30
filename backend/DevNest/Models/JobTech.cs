using DevNest.Models;

public class JobTech
{
    public int Id { get; set; }
    public int JobId { get; set; }
    public Job Job { get; set; } = null!;

    public string Tech { get; set; } = string.Empty; // ".NET", "Java", "React"
}
