using DevNest.DTOs.Companies;

namespace DevNest.Services.Companies;

public interface ICompanyProfileService
{
    /// <summary>
    /// Returns full company profile data for company page.
    /// </summary>
    Task<CompanyProfileDto?> GetByIdAsync(
        int companyId,
        CancellationToken ct = default);

    /// <summary>
    /// Returns full company profile by slug (future-proof if you add slugs).
    /// </summary>
    Task<CompanyProfileDto?> GetBySlugAsync(
        string slug,
        CancellationToken ct = default);
}
