using DevNest.Models;

using Microsoft.EntityFrameworkCore;

namespace DevNest.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        public DbSet<Job> Jobs { get; set; } = null!;
        public DbSet<Company> Companies { get; set; } = null!;
        public DbSet<Category> Categories { get; set; } = null!;

        public DbSet<JobTech> JobTechs { get; set; } = null!;

        public DbSet<Tech> Techs { get; set; }

        public DbSet<Event> Events { get; set; }

    }
}
