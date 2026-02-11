using DevNest.DTOs.Categories;
using DevNest.DTOs.Companies;

namespace DevNest.DTOs.Jobs;

public class JobAdDetailsDto
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string Slug { get; set; } = "";

    public string Location { get; set; } = "";
    public bool IsRemote { get; set; }
    public string JobType { get; set; } = "";
    public string ExperienceLevel { get; set; } = "";

    public DateTime CreatedAt { get; set; }

    public CompanyMiniDto Company { get; set; } = new();

    // “Published in categories” pills (dev.bg style)
    public List<CategoryPillDto> Categories { get; set; } = new();

    // Tech stack icons row
    public List<TechIconDto> TechStack { get; set; } = new();

    // Optional: long texts
    public string? CompanyAbout { get; set; }
    public string? Description { get; set; } // job description html/text
}