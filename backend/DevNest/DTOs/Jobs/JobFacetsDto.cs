namespace DevNest.DTOs.Jobs
{
   

    public class JobFacetsDto
    {
        public List<FacetItemDto> Locations { get; set; } = new();
        public List<FacetItemDto> ExperienceLevels { get; set; } = new();
        public List<FacetItemDto> JobTypes { get; set; } = new();
        public List<FacetItemDto> SalaryRanges { get; set; } = new();

        public int RemoteCount { get; set; }
        public int OfficeCount { get; set; }
    }
}
