namespace DevNest.DTOs.Companies
{
    public sealed class CompanyLocationStatDto
    {
        public string City { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public int Count { get; set; }
    }
}
