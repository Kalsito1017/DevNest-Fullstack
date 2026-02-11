namespace DevNest.DTOs.Companies
{
    public class CompanyJobMiniDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = "";
        public string? Location { get; set; }
        public bool IsRemote { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
