public class EventDto
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string? EventDate { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Description { get; set; }
    public List<SpeakerDto> Speakers { get; set; } = new();
}
