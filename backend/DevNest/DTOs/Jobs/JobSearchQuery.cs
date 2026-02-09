using Microsoft.AspNetCore.Mvc;

namespace DevNest.DTOs.Jobs
{
    public class JobSearchQuery
    {
        [FromQuery(Name = "q")]
        public string? Q { get; set; }

        [FromQuery(Name = "category")]
        public string? CategorySlug { get; set; }

        [FromQuery(Name = "tech")]
        public string? Tech { get; set; }

        [FromQuery(Name = "location")]
        public string? Location { get; set; }

        [FromQuery(Name = "remote")]
        public bool? Remote { get; set; }

        [FromQuery(Name = "experienceLevel")]
        public string? ExperienceLevel { get; set; }

        [FromQuery(Name = "salaryRange")]
        public string? SalaryRange { get; set; }

        [FromQuery(Name = "jobType")]
        public string? JobType { get; set; }

        [FromQuery(Name = "sort")]
        public string Sort { get; set; } = "newest";

        [FromQuery(Name = "page")]
        public int Page { get; set; } = 1;

        [FromQuery(Name = "pageSize")]
        public int PageSize { get; set; } = 20;
    }
}
