using DevNest.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

public class EventsService : IEventsService
{
    private readonly ApplicationDbContext _db;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public EventsService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<EventDto>> GetAllAsync(CancellationToken ct = default)
    {
        var entities = await _db.Events
            .AsNoTracking()
            .OrderByDescending(e => e.StartDate)

            .ThenBy(e => e.Id)
            .ToListAsync(ct);

        return entities.Select(MapToDto).ToList();
    }

    public async Task<EventDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var e = await _db.Events
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        return e == null ? null : MapToDto(e);
    }

    private static EventDto MapToDto(Event e)
    {
        var speakers = ParseSpeakers(e.SpeakersJson);

        return new EventDto
        {
            Id = e.Id,
            Title = e.Title,
            EventDate = e.EventDate,
            StartDate = e.StartDate,
            EndDate = e.EndDate,
            Description = e.Description,
            Speakers = speakers
        };
    }

    private static List<SpeakerDto> ParseSpeakers(string? speakersJson)
    {
        if (string.IsNullOrWhiteSpace(speakersJson))
            return new List<SpeakerDto>();

        try
        {
            return JsonSerializer.Deserialize<List<SpeakerDto>>(speakersJson, JsonOptions)
                   ?? new List<SpeakerDto>();
        }
        catch
        {
            // Ако JSON е счупен, не гърми целия endpoint
            return new List<SpeakerDto>();
        }
    }
}
