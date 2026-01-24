namespace DevNest.Services.Data
{
    using System;
    using System.Collections.Generic;
    using System.Text;
    using System.Threading.Tasks;

    using DevNest.Data.Models;

    public interface ICompanyService
    {
        Task<List<Company>> GetAllCompaniesAsync();

        Task<Company> GetCompanyByIdAsync(int id);

        Task<Company> GetCompanyBySlugAsync(string slug);

        Task<List<Company>> GetFeaturedCompaniesAsync();

        Task<List<Jobs>> GetCompanyJobsAsync(int companyId);

        Task<int> GetCompanyJobCountAsync(int companyId);

        Task<List<Company>> SearchCompaniesAsync(string searchTerm);

        Task<Company> CreateCompanyAsync(Company company);

        Task UpdateCompanyAsync(Company company);

        Task DeleteCompanyAsync(int id);

        Task<bool> CompanyExistsAsync(int id);
    }
}
