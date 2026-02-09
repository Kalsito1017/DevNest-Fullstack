using DevNest.DTOs.Companies;

namespace DevNest.Services.Companies.DTOs
{
    public sealed class CompanyListResponseDto
    {
        public int TotalCount { get; init; }
        public int Page { get; init; }
        public int PageSize { get; init; }
        public IReadOnlyList<CompanyCardDto> Items { get; init; } = Array.Empty<CompanyCardDto>();
    }
}
