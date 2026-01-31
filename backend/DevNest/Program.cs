using DevNest.Data;
using DevNest.Services.Jobs;
using DevNest.Services.Techs;
using Microsoft.EntityFrameworkCore;

namespace DevNest
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

        
            builder.Services.AddControllers()
                .AddJsonOptions(o => o.JsonSerializerOptions.PropertyNameCaseInsensitive = true);

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

          
            builder.Services.AddScoped<IJobSearchService, JobSearchService>();
            builder.Services.AddScoped<IJobReadService, JobReadService>();
            builder.Services.AddScoped<IJobHomeSectionsService, JobHomeSectionsService>();
            builder.Services.AddScoped<IJobStatsService, JobStatsService>();
         
            builder.Services.AddScoped<IEventsService, EventsService>();

          
            builder.Services.AddScoped<ITechReadService, TechReadService>();

           
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                {
                    policy.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader();
                });
            });

           
            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(connectionString));

            var app = builder.Build();

            if (app.Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseCors("AllowAll");
            app.UseHttpsRedirection();

            app.MapControllers();

            app.MapGet("/", () => "DevNest API - try /api/workshops");
            app.MapGet("/health", () => new { status = "healthy", time = DateTime.UtcNow });

            app.Run();
        }
    }
}
