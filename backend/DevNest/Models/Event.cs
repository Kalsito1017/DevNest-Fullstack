public class Event
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? EventDate { get; set; }   // "24.03.2026 - 02.04.2026"

    public DateTime CreatedAt { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public string? Description { get; set; }

    public string? SpeakersJson { get; set; }
}
