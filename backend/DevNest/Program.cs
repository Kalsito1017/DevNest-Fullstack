using DevNest.Data;
using DevNest.Services.Categories;
using DevNest.Services.Companies;
using DevNest.Services.Home;
using DevNest.Services.Jobs;
using DevNest.Services.Techs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using DevNest.Services.Files;

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
            builder.Services.AddScoped<IJobStatsService, JobStatsService>();
            builder.Services.AddScoped<IJobAdsService, JobAdsService>();
            builder.Services.AddScoped<ICompanyProfileService, CompanyProfileService>();

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("DevCors", policy =>
                {
                    policy
                        .WithOrigins("http://localhost:5173")
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
                        {
                            context.Token = token;
                        }

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

            
            using (var scope = app.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                await db.Database.MigrateAsync();
            }

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
    }
}
