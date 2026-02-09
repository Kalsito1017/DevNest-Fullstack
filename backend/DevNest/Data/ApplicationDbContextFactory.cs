using DevNest.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();

        var cs = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
                 ?? "Server=localhost,1433;Database=DevNestDB;User Id=sa;Password=DevNest!Passw0rd2026;TrustServerCertificate=True;";

        optionsBuilder.UseSqlServer(cs);

        return new ApplicationDbContext(optionsBuilder.Options);
    }
}
