using DevNest.Models.Jobs;
using DevNest.Models.Tech;

public class JobTech
{
    public int Id { get; set; }

    public int JobId { get; set; }
    public Job Job { get; set; } = null!;

    public int? TechId { get; set; }          // <-- add
   

    public string Tech { get; set; } = string.Empty; // display name (keep)
}
