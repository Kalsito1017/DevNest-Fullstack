using DevNest.Models;
using Microsoft.EntityFrameworkCore;

using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
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



    }
}
