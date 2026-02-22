using DevNest.DTOs.Events;

namespace DevNest.Services.Events
{
    public interface ISavedEventsService
    {
        Task<bool> ToggleAsync(string userId, int eventId, CancellationToken ct = default);
        Task<IReadOnlyList<SavedEventDto>> GetMySavedAsync(string userId, CancellationToken ct = default);
        Task<bool> IsSavedAsync(string userId, int eventId, CancellationToken ct = default); // optional, useful for FE
    }
}
