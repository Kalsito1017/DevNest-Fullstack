using DevNest.Data;
using DevNest.DTOs.Events;
using DevNest.Models;
using Microsoft.EntityFrameworkCore;

namespace DevNest.Services.Events
{
    public class SavedEventsService : ISavedEventsService
    {
        private readonly ApplicationDbContext db;

        public SavedEventsService(ApplicationDbContext db)
        {
            this.db = db;
        }

        public async Task<bool> ToggleAsync(string userId, int eventId, CancellationToken ct = default)
        {
            // Ensure event exists (optional but nice)
            var exists = await db.Events.AsNoTracking().AnyAsync(e => e.Id == eventId, ct);
            if (!exists) throw new KeyNotFoundException("Event not found.");

            var row = await db.UserSavedEvents
                .FirstOrDefaultAsync(x => x.UserId == userId && x.EventId == eventId, ct);

            if (row != null)
            {
                db.UserSavedEvents.Remove(row);
                await db.SaveChangesAsync(ct);
                return false; // now unsaved
            }

            db.UserSavedEvents.Add(new UserSavedEvent
            {
                UserId = userId,
                EventId = eventId,
                CreatedAt = DateTime.UtcNow
            });

            await db.SaveChangesAsync(ct);
            return true; // now saved
        }

        public async Task<IReadOnlyList<SavedEventDto>> GetMySavedAsync(string userId, CancellationToken ct = default)
        {
            // Pull from join table -> project event fields (fast, no tracking)
            var items = await db.UserSavedEvents
                .AsNoTracking()
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new SavedEventDto
                {
                    Id = x.Event.Id,
                    Title = x.Event.Title,
                    EventDate = x.Event.EventDate,
                    StartDate = x.Event.StartDate,
                    EndDate = x.Event.EndDate,
                    Description = x.Event.Description,
                    SavedAt = x.CreatedAt
                })
                .ToListAsync(ct);

            return items;
        }

        public async Task<bool> IsSavedAsync(string userId, int eventId, CancellationToken ct = default)
        {
            return await db.UserSavedEvents
                .AsNoTracking()
                .AnyAsync(x => x.UserId == userId && x.EventId == eventId, ct);
        }
    }
}
