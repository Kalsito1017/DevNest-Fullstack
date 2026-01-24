namespace DevNest.Services.Data
{
    using System.Collections.Generic;
    using System.Threading.Tasks;

    using DevNest.Data.Models;

    public interface IJobsService
    {
        // Get methods
        Task<List<Jobs>> GetAllJobsAsync();

        Task<Jobs> GetJobByIdAsync(int id);

        Task<List<Jobs>> GetJobsByCompanyIdAsync(int companyId);

        // Filter methods
        Task<List<Jobs>> GetJobsByEmploymentTypeAsync(string employmentType);

        Task<List<Jobs>> GetJobsByExperienceLevelAsync(string experienceLevel);

        Task<List<Jobs>> GetJobsByLocationAsync(string location);

        // Search methods
        Task<List<Jobs>> SearchJobsAsync(string keyword, string location = null, string employmentType = null);

        // Sorting methods
        Task<List<Jobs>> GetJobsBySalaryDescendingAsync();

        Task<List<Jobs>> GetJobsByPostedDateDescendingAsync();

        // Stats methods
        Task<int> GetJobCountAsync();

        Task<decimal> GetAverageSalaryAsync();

        Task<int> GetJobsCountByCompanyAsync(int companyId);

        // CRUD methods
        Task<Jobs> CreateJobAsync(Jobs job);

        Task UpdateJobAsync(Jobs job);

        Task DeleteJobAsync(int id);

        // Utility methods
        Task<bool> JobExistsAsync(int id);
    }
}
