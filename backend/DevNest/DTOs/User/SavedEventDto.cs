namespace DevNest.DTOs.Events
{
    public class SavedEventDto
    {
        public int Id { get; set; }              // EventId
        public string Title { get; set; } = string.Empty;
        public string? EventDate { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Description { get; set; }

        public DateTime SavedAt { get; set; }    // UserSavedEvent.CreatedAt
    }
}
