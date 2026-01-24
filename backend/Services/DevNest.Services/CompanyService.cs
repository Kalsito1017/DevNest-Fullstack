namespace DevNest.Services.Data
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Threading.Tasks;
    using DevNest.Data;
    using DevNest.Data.Models;
    using Microsoft.EntityFrameworkCore;

    internal class CompanyService : ICompanyService
    {
        private readonly ApplicationDbContext context;

        public CompanyService(ApplicationDbContext context)
        {
            this.context = context;
        }

        public async Task<List<Company>> GetAllCompaniesAsync()
        {
            return await this.context.Companies
                .Include(c => c.Logo)
                .Include(c => c.CompanyTechnologies)
                    .ThenInclude(ct => ct.Technology)
                .OrderByDescending(c => c.CreatedOn)
                .ToListAsync();
        }

        public async Task<Company> GetCompanyByIdAsync(int id)
        {
            return await this.context.Companies
                .Include(c => c.Logo)
                .Include(c => c.CompanyTechnologies)
                    .ThenInclude(ct => ct.Technology)
                .Include(c => c.Jobs) // Include jobs if needed
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Company> GetCompanyBySlugAsync(string slug)
        {
            return await this.context.Companies
                .Include(c => c.Logo)
                .Include(c => c.CompanyTechnologies)
                    .ThenInclude(ct => ct.Technology)
                .FirstOrDefaultAsync(c => c.Slug == slug);
        }

        public async Task<List<Company>> GetFeaturedCompaniesAsync()
        {
            return await this.context.Companies
                .Include(c => c.Logo)
                .Include(c => c.CompanyTechnologies)
                    .ThenInclude(ct => ct.Technology)
                .Where(c => c.TrophyCount > 0) // Featured companies have trophies
                .OrderByDescending(c => c.TrophyCount)
                .Take(10)
                .ToListAsync();
        }

        public async Task<List<Jobs>> GetCompanyJobsAsync(int companyId)
        {
            return await this.context.Jobs
                .Include(j => j.Company)
                .Where(j => j.CompanyId == companyId)
                .OrderByDescending(j => j.PostedDate)
                .ToListAsync();
        }

        public async Task<int> GetCompanyJobCountAsync(int companyId)
        {
            return await this.context.Jobs
                .Where(j => j.CompanyId == companyId)
                .CountAsync();
        }

        public async Task<List<Company>> SearchCompaniesAsync(string searchTerm)
        {
            return await this.context.Companies
                .Include(c => c.Logo)
                .Where(c => c.Name.Contains(searchTerm) ||
                           c.Description.Contains(searchTerm))
                .OrderByDescending(c => c.CreatedOn)
                .ToListAsync();
        }

        public async Task<Company> CreateCompanyAsync(Company company)
        {
            await this.context.Companies.AddAsync(company);
            await this.context.SaveChangesAsync();
            return company;
        }

        public async Task UpdateCompanyAsync(Company company)
        {
            this.context.Companies.Update(company);
            await this.context.SaveChangesAsync();
        }

        public async Task DeleteCompanyAsync(int id)
        {
            var company = await this.GetCompanyByIdAsync(id);
            if (company != null)
            {
                this.context.Companies.Remove(company);
                await this.context.SaveChangesAsync();
            }
        }

        public async Task<bool> CompanyExistsAsync(int id)
        {
            return await this.context.Companies.AnyAsync(c => c.Id == id);
        }
    }
}
