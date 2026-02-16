using DevNest.Data;
using DevNest.Services.Categories;
using DevNest.Services.Companies;
using DevNest.Services.Events;
using DevNest.Services.Home;
using DevNest.Services.JobApplications;
using DevNest.Services.Jobs;
using DevNest.Services.Techs;
using DevNest.Services.User;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace DevNest
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddControllers()
                .AddJsonOptions(o => o.JsonSerializerOptions.PropertyNameCaseInsensitive = true);

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(connectionString));

            builder.Services.AddScoped<IJobSearchService, JobSearchService>();
            builder.Services.AddScoped<IJobReadService, JobReadService>();
            builder.Services.AddScoped<IJobHomeSectionsService, JobHomeSectionsService>();
            builder.Services.AddScoped<IJobStatsService, JobStatsService>();
            builder.Services.AddScoped<IEventsService, EventsService>();
            builder.Services.AddScoped<ITechReadService, TechReadService>();
            builder.Services.AddScoped<ICategoryReadService, CategoryReadService>();
            builder.Services.AddScoped<ICompanyReadService, CompanyReadService>();
            builder.Services.AddScoped<ICompanyJobsReadService, CompanyJobsReadService>();
            builder.Services.AddScoped<IHomeSectionsService, HomeSectionsService>();
            builder.Services.AddScoped<IFilesService, FilesService>();
            builder.Services.AddScoped<ISavedJobsService, SavedJobsService>();
            builder.Services.AddScoped<IJobAdsService, JobAdsService>();
            builder.Services.AddScoped<ICompanyProfileService, CompanyProfileService>();
            builder.Services.AddScoped<ISavedEventsService, SavedEventsService>();
            builder.Services.AddScoped<IJobApplicationsService, JobApplicationsService>();

            var corsOrigins = builder.Configuration
                .GetSection("Cors:Origins")
                .Get<string[]>() ?? new[] { "http://localhost:5173" };

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("DevCors", policy =>
                {
                    policy
                        .WithOrigins(corsOrigins)
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                });
            });

            builder.Services
                .AddIdentityCore<ApplicationUser>(options =>
                {
                    options.Password.RequireDigit = true;
                    options.Password.RequiredLength = 6;
                    options.User.RequireUniqueEmail = true;
                })
                .AddRoles<IdentityRole>()
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddSignInManager<SignInManager<ApplicationUser>>();

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        if (context.Request.Cookies.TryGetValue("access_token", out var token))
                            context.Token = token;

                        return Task.CompletedTask;
                    }
                };

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
                    ),
                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                    ValidAudience = builder.Configuration["Jwt:Audience"]
                };
            });

            builder.Services.AddAuthorization();

            var app = builder.Build();

            if (app.Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseCors("DevCors");

            app.UseHttpsRedirection();

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.MapGet("/", () => "DevNest API - try /swagger");
            app.MapGet("/health", () => new { status = "healthy", time = DateTime.UtcNow });

            // ✅ FIX: migrate with retry + handle "DB already exists" race (SqlException 1801)
            await MigrateWithRetryAsync(app.Services);

            var skipSeed = string.Equals(
                Environment.GetEnvironmentVariable("SKIP_SEED"),
                "true",
                StringComparison.OrdinalIgnoreCase);

            if (!skipSeed)
            {
                using var scope = app.Services.CreateScope();
                await AdminSeeder.SeedAsync(scope.ServiceProvider, app.Configuration);
            }

            await app.RunAsync();
        }

        private static async Task MigrateWithRetryAsync(IServiceProvider services)
        {
            const int maxAttempts = 12; // ~1-2 minutes depending on delays

            for (int attempt = 1; attempt <= maxAttempts; attempt++)
            {
                try
                {
                    using var scope = services.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                    // If SQL isn't ready yet, CanConnect can throw; that's fine, we'll retry.
                    // If it can connect, migrate normally.
                    var canConnect = await db.Database.CanConnectAsync();
                    await db.Database.MigrateAsync();
                    return;
                }
                catch (SqlException ex) when (ex.Number == 1801)
                {
                    // Database already exists (race during startup) -> just migrate again
                    using var scope = services.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                    await db.Database.MigrateAsync();
                    return;
                }
                catch (Exception) when (attempt < maxAttempts)
                {
                    // SQL Server container not ready yet / transient startup failure
                    var delayMs = Math.Min(2000 * attempt, 15000);
                    await Task.Delay(delayMs);
                }
            }

            // Final attempt: let the exception bubble with full details
            using (var scope = services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                await db.Database.MigrateAsync();
            }
        }
    }
}