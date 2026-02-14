using DevNest.Models.Companies;
using DevNest.Models.Files;
using DevNest.Models.JobApplications;
using DevNest.Models.Jobs;
using DevNest.Models.Tech;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
namespace DevNest.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public DbSet<Job> Jobs { get; set; } = null!;
        public DbSet<Company> Companies { get; set; } = null!;
        public DbSet<Category> Categories { get; set; } = null!;
        public DbSet<JobTech> JobTechs { get; set; } = null!;
        public DbSet<Tech> Techs { get; set; } = null!;
        public DbSet<Event> Events { get; set; } = null!;
        public DbSet<UserFile> UserFiles => Set<UserFile>();

        public DbSet<SavedJob> SavedJobs => Set<SavedJob>();

        public DbSet<UserSavedEvent> UserSavedEvents => Set<UserSavedEvent>();

        public DbSet<JobApplication> JobApplications => Set<JobApplication>();
        public DbSet<JobApplicationUser> JobApplicationUsers => Set<JobApplicationUser>();
        public DbSet<JobApplicationFile> JobApplicationFiles => Set<JobApplicationFile>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<UserSavedEvent>()
                .HasIndex(x => new { x.UserId, x.EventId })
                .IsUnique();

            builder.Entity<UserSavedEvent>()
                .HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<UserSavedEvent>()
                .HasOne(x => x.Event)
                .WithMany()
                .HasForeignKey(x => x.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<JobApplication>(e =>
            {
                // Prevent double apply (User + Job must be unique)
                e.HasIndex(x => new { x.UserId, x.JobId })
                    .IsUnique();

                e.HasOne(x => x.User)
                    .WithMany()
                    .HasForeignKey(x => x.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                e.HasOne(x => x.Job)
                    .WithMany()
                    .HasForeignKey(x => x.JobId)
                    .OnDelete(DeleteBehavior.Cascade);

                // One-to-one snapshot
                e.HasOne(x => x.Applicant)
                    .WithOne(x => x.JobApplication)
                    .HasForeignKey<JobApplicationUser>(x => x.JobApplicationId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // -----------------------
            // JobApplicationUser (Snapshot)
            // -----------------------
            builder.Entity<JobApplicationUser>(e =>
            {
                e.Property(x => x.FirstName)
                    .HasMaxLength(100)
                    .IsRequired();

                e.Property(x => x.LastName)
                    .HasMaxLength(100)
                    .IsRequired();

                e.Property(x => x.Email)
                    .HasMaxLength(200)
                    .IsRequired();

                // MotivationLetter left as nvarchar(max)
            });

            // -----------------------
            // JobApplicationFile
            // -----------------------
            builder.Entity<JobApplicationFile>(e =>
            {
                // Prevent duplicate file attach in same application
                e.HasIndex(x => new { x.JobApplicationId, x.UserFileId })
                    .IsUnique();

                e.HasOne(x => x.JobApplication)
                    .WithMany(x => x.Files)
                    .HasForeignKey(x => x.JobApplicationId)
                    .OnDelete(DeleteBehavior.Cascade);

                // IMPORTANT:
                // Do NOT cascade delete UserFile if application is deleted
                e.HasOne(x => x.UserFile)
                    .WithMany()
                    .HasForeignKey(x => x.UserFileId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
