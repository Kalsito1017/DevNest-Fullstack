using DevNest.Data;
using DevNest.DTOs.JobApplications;
using DevNest.Models.JobApplications;
using DevNest.Services.User;
using Microsoft.EntityFrameworkCore;

namespace DevNest.Services.JobApplications;

public class JobApplicationsService : IJobApplicationsService
{
    private readonly ApplicationDbContext db;
    private readonly IFilesService files;

    public JobApplicationsService(ApplicationDbContext db, IFilesService files)
    {
        this.db = db;
        this.files = files;
    }

    public async Task<ApplyJobResponseDto> ApplyAsync(string userId, ApplyJobRequestDto dto, CancellationToken ct = default)
    {
        // Basic validation
        if (dto.JobId <= 0) throw new InvalidOperationException("Invalid job id.");
        if (string.IsNullOrWhiteSpace(dto.FirstName)) throw new InvalidOperationException("First name is required.");
        if (string.IsNullOrWhiteSpace(dto.LastName)) throw new InvalidOperationException("Last name is required.");
        if (string.IsNullOrWhiteSpace(dto.Email)) throw new InvalidOperationException("Email is required.");

        // Job exists
        var jobExists = await db.Jobs.AsNoTracking().AnyAsync(j => j.Id == dto.JobId, ct);
        if (!jobExists) throw new InvalidOperationException("Job not found.");

        // Prevent double apply
        var alreadyApplied = await db.JobApplications
            .AsNoTracking()
            .AnyAsync(a => a.JobId == dto.JobId && a.UserId == userId, ct);

        if (alreadyApplied) throw new InvalidOperationException("Already applied for this job.");

        var app = new JobApplication
        {
            JobId = dto.JobId,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,

            Applicant = new JobApplicationUser
            {
                FirstName = dto.FirstName.Trim(),
                LastName = dto.LastName.Trim(),
                Email = dto.Email.Trim(),
                MotivationLetter = (dto.MotivationLetter ?? "").Trim(),
            }
        };

        // Attach existing user files (from "My files")
        if (dto.ExistingUserFileIds is { Count: > 0 })
        {
            var ids = dto.ExistingUserFileIds
                .Where(x => x > 0)
                .Distinct()
                .ToList();

            if (ids.Count > 0)
            {
                var ownedIds = await db.UserFiles
                    .AsNoTracking()
                    .Where(f => f.UserId == userId && ids.Contains(f.Id))
                    .Select(f => f.Id)
                    .ToListAsync(ct);

                if (ownedIds.Count != ids.Count)
                    throw new InvalidOperationException("Some selected files are invalid.");

                foreach (var fileId in ownedIds)
                {
                    app.Files.Add(new JobApplicationFile
                    {
                        UserFileId = fileId
                    });
                }
            }
        }

    
        if (dto.NewFiles is { Count: > 0 })
        {
            foreach (var file in dto.NewFiles)
            {
                if (file is null || file.Length <= 0) continue;

         
                var created = await files.UploadAsync(userId, file, ct);

                app.Files.Add(new JobApplicationFile
                {
                    UserFileId = created.Id
                });
            }
        }

        db.JobApplications.Add(app);
        await db.SaveChangesAsync(ct);

        return new ApplyJobResponseDto { ApplicationId = app.Id };
    }

    public async Task<IReadOnlyList<MyJobApplicationListItemDto>> GetMineAsync(string userId, CancellationToken ct = default)
    {
        // If you define "active" with ExpiresAt:
        // IsJobActive = a.Job.IsActive && (a.Job.ExpiresAt == null || a.Job.ExpiresAt > DateTime.UtcNow)

        var items = await db.JobApplications
            .AsNoTracking()
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new MyJobApplicationListItemDto
            {
                ApplicationId = a.Id,
                AppliedAt = a.CreatedAt,

                JobId = a.JobId,
                JobTitle = a.Job.Title,

                CompanyId = a.Job.CompanyId,
                CompanyName = a.Job.Company.Name,

                IsJobActive = a.Job.Status == "Active"
            })
            .ToListAsync(ct);

        return items;
    }
}