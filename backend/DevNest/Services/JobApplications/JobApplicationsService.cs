using DevNest.Data;
using DevNest.DTOs.JobApplications;
using DevNest.Models.JobApplications;
using DevNest.Services.User;
using DevNest.EmailTemplates;
using Microsoft.EntityFrameworkCore;
using DevNest.Services.Email;

namespace DevNest.Services.JobApplications;

public class JobApplicationsService : IJobApplicationsService
{
    private readonly ApplicationDbContext db;
    private readonly IFilesService files;
    private readonly BrevoEmailService email; // <-- add

    public JobApplicationsService(ApplicationDbContext db, IFilesService files, BrevoEmailService email)
    {
        this.db = db;
        this.files = files;
        this.email = email;
    }

    public async Task<ApplyJobResponseDto> ApplyAsync(string userId, ApplyJobRequestDto dto, CancellationToken ct = default)
    {
        // Basic validation
        if (dto.JobId <= 0) throw new InvalidOperationException("Invalid job id.");
        if (string.IsNullOrWhiteSpace(dto.FirstName)) throw new InvalidOperationException("First name is required.");
        if (string.IsNullOrWhiteSpace(dto.LastName)) throw new InvalidOperationException("Last name is required.");
        if (string.IsNullOrWhiteSpace(dto.Email)) throw new InvalidOperationException("Email is required.");

        // Job exists + also fetch details for email (single query)
        var jobInfo = await db.Jobs
            .AsNoTracking()
            .Where(j => j.Id == dto.JobId)
            .Select(j => new
            {
                j.Id,
                j.Title,
                CompanyName = j.Company.Name
            })
            .FirstOrDefaultAsync(ct);

        if (jobInfo is null) throw new InvalidOperationException("Job not found.");

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

        // Upload new files
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

        // Send confirmation email to applicant (do not fail the application if email fails)
        try
        {
            var (subject, html) = ApplicationEmails.ThanksForApplying(
                applicantFirstName: app.Applicant.FirstName,
                jobTitle: jobInfo.Title,
                companyName: jobInfo.CompanyName
            );

            await email.SendAsync(
                toEmail: app.Applicant.Email,
                toName: $"{app.Applicant.FirstName} {app.Applicant.LastName}".Trim(),
                subject: subject,
                htmlBody: html,
                replyToEmail: null,
                replyToName: null
            );
        }
        catch
        {
            // Optional: log warning (recommended), but don't throw.
        }

        return new ApplyJobResponseDto { ApplicationId = app.Id };
    }

    public async Task<IReadOnlyList<MyJobApplicationListItemDto>> GetMineAsync(string userId, CancellationToken ct = default)
    {
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