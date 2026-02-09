using DevNest.DTOs.Companies;

namespace DevNest.Services.Companies
{
    public interface ICompanyReadService
    {
        Task<IReadOnlyList<CompanyCardDto>> GetAllAsync(bool onlyActive, CancellationToken ct = default);
        Task<CompanyDetailsDto?> GetByIdAsync(int id, CancellationToken ct = default);

        Task<(int TotalCount, IReadOnlyList<CompanyCardDto> Items)> GetCompanyCardsAsync(
            string? search,
            string sort,
            bool onlyActive,
            string? sizeBucket,
            string? location,
            CancellationToken ct = default);



        Task<CompanySizeStatsDto> GetCompanySizeStatsAsync(bool onlyActive, CancellationToken ct = default);

        Task<IReadOnlyList<CompanyLocationStatDto>> GetCompanyLocationStatsAsync(bool onlyActive, CancellationToken ct = default);

        Task<IReadOnlyList<CompanyMapDto>> GetCompaniesForMapAsync(bool onlyActive, CancellationToken ct = default);
        Task<IReadOnlyList<CompanySuggestDto>> SuggestAsync(
    string? q,
    int take = 8,
    bool onlyActive = true,
    CancellationToken ct = default);


    }
}
