using DevNest.Models;

public class JobTech
{
    public int Id { get; set; }

    public int JobId { get; set; }
    public Job Job { get; set; } = null!;

    public int? TechId { get; set; }          // <-- add
    public Tech? TechRef { get; set; }        // <-- add (navigation)

    public string Tech { get; set; } = string.Empty; // display name (keep)
}
