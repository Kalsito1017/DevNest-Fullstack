namespace DevNest.DTOs.Companies
{
    public sealed class CompanySizeStatsDto
    {
        public int Micro { get; set; }   // < 10
        public int Small { get; set; }   // <= 30
        public int Medium { get; set; }  // <= 70
        public int Large { get; set; }   // > 70
        public int Total { get; set; }
    }
}
