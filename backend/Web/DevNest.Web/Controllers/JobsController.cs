namespace DevNest.API.Controllers
{
    using System.Collections.Generic;
    using System.Threading.Tasks;

    using DevNest.Data.Models;
    using DevNest.Services.Data;
    using Microsoft.AspNetCore.Mvc;

    [ApiController]
    [Route("api/[controller]")]
    public class JobsController : ControllerBase
    {
        private readonly IJobsService jobsService;

        public JobsController(IJobsService jobsService)
        {
            this.jobsService = jobsService;
        }

        // GET: api/jobs
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Jobs>>> GetAll()
        {
            var jobs = await this.jobsService.GetAllJobsAsync();
            return this.Ok(jobs);
        }

        // GET: api/jobs/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Jobs>> GetById(int id)
        {
            var job = await this.jobsService.GetJobByIdAsync(id);

            if (job == null)
            {
                return this.NotFound();
            }

            return this.Ok(job);
        }

        // GET: api/jobs/company/5
        [HttpGet("company/{companyId}")]
        public async Task<ActionResult<IEnumerable<Jobs>>> GetByCompany(int companyId)
        {
            var jobs = await this.jobsService.GetJobsByCompanyIdAsync(companyId);
            return Ok(jobs);
        }

        // GET: api/jobs/employment-type/{type}
        [HttpGet("employment-type/{employmentType}")]
        public async Task<ActionResult<IEnumerable<Jobs>>> GetByEmploymentType(string employmentType)
        {
            var jobs = await this.jobsService.GetJobsByEmploymentTypeAsync(employmentType);
            return Ok(jobs);
        }

        // GET: api/jobs/experience-level/{level}
        [HttpGet("experience-level/{experienceLevel}")]
        public async Task<ActionResult<IEnumerable<Jobs>>> GetByExperienceLevel(string experienceLevel)
        {
            var jobs = await this.jobsService.GetJobsByExperienceLevelAsync(experienceLevel);
            return Ok(jobs);
        }

        // GET: api/jobs/location/{location}
        [HttpGet("location/{location}")]
        public async Task<ActionResult<IEnumerable<Jobs>>> GetByLocation(string location)
        {
            var jobs = await this.jobsService.GetJobsByLocationAsync(location);
            return Ok(jobs);
        }

        // GET: api/jobs/sorted/salary-desc
        [HttpGet("sorted/salary-desc")]
        public async Task<ActionResult<IEnumerable<Jobs>>> GetBySalaryDescending()
        {
            var jobs = await this.jobsService.GetJobsBySalaryDescendingAsync();
            return Ok(jobs);
        }

        // GET: api/jobs/sorted/recent
        [HttpGet("sorted/recent")]
        public async Task<ActionResult<IEnumerable<Jobs>>> GetRecent()
        {
            var jobs = await this.jobsService.GetJobsByPostedDateDescendingAsync();
            return Ok(jobs);
        }

        // GET: api/jobs/search?keyword=.NET&location=Sofia&employmentType=Full-time
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Jobs>>> Search(
            [FromQuery] string keyword,
            [FromQuery] string location = null,
            [FromQuery] string employmentType = null)
        {
            var jobs = await this.jobsService.SearchJobsAsync(keyword, location, employmentType);
            return Ok(jobs);
        }

        // GET: api/jobs/stats
        [HttpGet("stats")]
        public async Task<ActionResult<object>> GetStats()
        {
            var totalJobs = await this.jobsService.GetJobCountAsync();
            var averageSalary = await this.jobsService.GetAverageSalaryAsync();

            return Ok(new
            {
                TotalJobs = totalJobs,
                AverageSalary = averageSalary
            });
        }

        // GET: api/jobs/stats/company/5
        [HttpGet("stats/company/{companyId}")]
        public async Task<ActionResult<int>> GetCompanyJobCount(int companyId)
        {
            var count = await this.jobsService.GetJobsCountByCompanyAsync(companyId);
            return Ok(count);
        }

        // POST: api/jobs
        [HttpPost]
        public async Task<ActionResult<Jobs>> Create(Jobs job)
        {
            if (!this.ModelState.IsValid)
            {
                return BadRequest(this.ModelState);
            }

            var createdJob = await this.jobsService.CreateJobAsync(job);
            return CreatedAtAction(nameof(GetById), new { id = createdJob.Id }, createdJob);
        }

        // PUT: api/jobs/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Jobs job)
        {
            if (id != job.Id)
            {
                return this.BadRequest();
            }

            if (!this.ModelState.IsValid)
            {
                return BadRequest(this.ModelState);
            }

            if (!await this.jobsService.JobExistsAsync(id))
            {
                return this.NotFound();
            }

            await this.jobsService.UpdateJobAsync(job);
            return this.NoContent();
        }

        // DELETE: api/jobs/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            if (!await this.jobsService.JobExistsAsync(id))
            {
                return this.NotFound();
            }

            await this.jobsService.DeleteJobAsync(id);
            return this.NoContent();
        }
    }
}