namespace DevNest.Data.Models
{
    public class CompanyTechnology
    {
        public int Id { get; set; }

        public int CompanyId { get; set; }

        public Company Company { get; set; }

        public int TechnologyId { get; set; }

        public Technology Technology { get; set; }
    }
}
