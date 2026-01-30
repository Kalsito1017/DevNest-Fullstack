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
}
