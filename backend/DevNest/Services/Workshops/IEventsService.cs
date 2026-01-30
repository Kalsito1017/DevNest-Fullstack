public interface IEventsService
{
    Task<IReadOnlyList<EventDto>> GetAllAsync(CancellationToken ct = default);
    Task<EventDto?> GetByIdAsync(int id, CancellationToken ct = default);
}
