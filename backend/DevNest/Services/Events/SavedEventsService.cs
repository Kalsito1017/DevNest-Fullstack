using DevNest.Data;
using DevNest.DTOs.Events;
using DevNest.Models;
using DevNest.Services.Email;
using Microsoft.EntityFrameworkCore;
using System.Net;
using DevNest.EmailTemplates;

namespace DevNest.Services.Events
{
    public class SavedEventsService : ISavedEventsService
    {
        private readonly ApplicationDbContext db;
        private readonly BrevoEmailService email;

        public SavedEventsService(ApplicationDbContext db, BrevoEmailService email)
        {
            this.db = db;
            this.email = email;
        }

        public async Task<bool> ToggleAsync(string userId, int eventId, CancellationToken ct = default)
        {
            // Load event info (we need title/date for the email)
            var evt = await db.Events
                .AsNoTracking()
                .Where(e => e.Id == eventId)
                .Select(e => new
                {
                    e.Id,
                    e.Title,
                    e.EventDate,
                    e.StartDate,
                    e.EndDate
                })
                .FirstOrDefaultAsync(ct);

            if (evt is null) throw new KeyNotFoundException("Event not found.");

            var row = await db.UserSavedEvents
                .FirstOrDefaultAsync(x => x.UserId == userId && x.EventId == eventId, ct);

            // UNSAVE
            if (row != null)
            {
                db.UserSavedEvents.Remove(row);
                await db.SaveChangesAsync(ct);
                return false; // now unsaved
            }

            // SAVE
            db.UserSavedEvents.Add(new UserSavedEvent
            {
                UserId = userId,
                EventId = eventId,
                CreatedAt = DateTime.UtcNow
            });

            await db.SaveChangesAsync(ct);

            // Send email confirmation to the user (do NOT fail toggle if email fails)
            try
            {
                var u = await db.Users
                    .AsNoTracking()
                    .Where(x => x.Id == userId)
                    .Select(x => new { x.Email, x.FirstName, x.LastName })
                    .FirstOrDefaultAsync(ct);

                if (u is not null && !string.IsNullOrWhiteSpace(u.Email))
                {
                    // Pick best available date text
                    var whenText =
     !string.IsNullOrWhiteSpace(evt.EventDate) ? evt.EventDate :
     evt.StartDate is not null ? evt.StartDate.Value.ToString("dd.MM.yyyy") :
     "—";

                    var safeName = WebUtility.HtmlEncode(u.FirstName ?? "");
                    var safeTitle = WebUtility.HtmlEncode(evt.Title ?? "Workshop");
                    var safeWhen = WebUtility.HtmlEncode(whenText);

                    var (subject, html) = SavedEventEmails.SeatReserved(
    firstName: u.FirstName,
    eventTitle: evt.Title,
    whenText: whenText
);


                    await email.SendAsync(
                        toEmail: u.Email,
                        toName: $"{u.FirstName} {u.LastName}".Trim(),
                        subject: subject,
                        htmlBody: html
                    );
                }
            }
            catch
            {
                // Optional: log warning, but don't throw.
            }

            return true; // now saved
        }

        public async Task<IReadOnlyList<SavedEventDto>> GetMySavedAsync(string userId, CancellationToken ct = default)
        {
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