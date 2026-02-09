namespace DevNest.Services.Companies.DTOs
{
    public sealed class CompanyListQuery
    {
        public string? Search { get; init; }
        public string Sort { get; init; } = "random"; // random | alpha | newest
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 24;
    }
}
