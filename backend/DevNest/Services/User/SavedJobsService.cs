using DevNest.Data;
using DevNest.DTOs.Jobs;
using Microsoft.EntityFrameworkCore;

namespace DevNest.Services.User
{
    public class SavedJobsService : ISavedJobsService
    {
        private readonly ApplicationDbContext db;

        public SavedJobsService(ApplicationDbContext db)
        {
            this.db = db;
        }

        public async Task<bool> ToggleAsync(string userId, int jobId, CancellationToken ct = default)
        {
            var existing = await db.SavedJobs
                .FirstOrDefaultAsync(x => x.UserId == userId && x.JobId == jobId, ct);

            if (existing != null)
            {
                db.SavedJobs.Remove(existing);
                await db.SaveChangesAsync(ct);
                return false; // unsaved
            }

            db.SavedJobs.Add(new SavedJob
            {
                UserId = userId,
                JobId = jobId,
                CreatedAt = DateTime.UtcNow
            });

            await db.SaveChangesAsync(ct);
            return true; // saved
        }

        public async Task<IReadOnlyList<JobCardDto>> GetMySavedAsync(
            string userId,
            CancellationToken ct = default)
        {
            return await db.SavedJobs
                .AsNoTracking()
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => x.Job)
                .Select(j => new JobCardDto
                {
                    Id = j.Id,
                    Title = j.Title,
                    Location = j.Location,
                    IsRemote = j.IsRemote,
                    JobType = j.JobType,
                    ExperienceLevel = j.ExperienceLevel,
                    Status = j.Status,
                    CreatedAt = j.CreatedAt,
                    CompanyId = j.CompanyId,
                    CompanyName = j.Company.Name,
                    CompanyLogoUrl = j.Company.LogoUrl,
                    CategoryId = j.CategoryId,
                    CategoryName = j.Category != null ? j.Category.Name : null,
                    CategorySlug = j.Category != null ? j.Category.Slug : null
                })
                .ToListAsync(ct);
        }
    }
}
