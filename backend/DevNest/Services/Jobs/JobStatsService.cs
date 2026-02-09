using DevNest.Data;
using DevNest.DTOs.Techs;
using DevNest.Services.Jobs;
using Microsoft.EntityFrameworkCore;

public class JobStatsService : IJobStatsService
{
    private readonly ApplicationDbContext db;

    public JobStatsService(ApplicationDbContext db)
    {
        this.db = db;
    }

    public async Task<IReadOnlyList<TechStatDto>> GetTechStatsAsync(CancellationToken ct = default)
    {
        var techCounts = await db.JobTechs
            .AsNoTracking()
            .Where(jt => jt.Job.Status == "Active")
            .GroupBy(jt => jt.Tech)
            .Select(g => new
            {
                Tech = g.Key,
                Count = g.Select(x => x.JobId).Distinct().Count()
            })
            .ToListAsync(ct);

     

        var result = techCounts.Select(tc =>
        {
            var normalizedTech = tc.Tech.ToLowerInvariant();

 

            return new TechStatDto
            {
                Tech = tc.Tech,
                Count = tc.Count,
                
            };
        })
        .OrderByDescending(x => x.Count)
        .ToList();

        return result;
    }
    private static (string? Location, bool Remote) NormalizeLocationAndRemote(string? location, bool remote)
    {
        var loc = string.IsNullOrWhiteSpace(location) ? null : location.Trim();

        // accept location=remote as remote=true
        if (!remote && loc is not null && loc.Equals("remote", StringComparison.OrdinalIgnoreCase))
            remote = true;

        // normalize slugs to DB text
        if (!remote && loc is not null)
        {
            loc = loc.ToLowerInvariant() switch
            {
                "sofia" => "Sofia",
                "varna" => "Varna",
                "plovdiv" => "Plovdiv",
                "burgas" => "Burgas",
                "ruse" => "Ruse",
                _ => loc
            };
        }

        return (remote ? null : loc, remote);
    }

    public async Task<JobsCountDto> GetCountAsync(string? location, bool remote, CancellationToken ct = default)
    {
        var visibleStatuses = new[] { "Active", "Open", "Published" };

        var q = db.Jobs.AsNoTracking().Where(j => visibleStatuses.Contains(j.Status));

        var (loc, isRemote) = NormalizeLocationAndRemote(location, remote);

        if (isRemote)
            q = q.Where(j => j.IsRemote);
        else if (!string.IsNullOrWhiteSpace(loc))
            q = q.Where(j => j.Location == loc); // or Like/Contains if needed

        var total = await q.CountAsync(ct);
        return new JobsCountDto { TotalCount = total };
    }

}
