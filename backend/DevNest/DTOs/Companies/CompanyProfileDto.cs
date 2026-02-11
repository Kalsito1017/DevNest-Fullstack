namespace DevNest.DTOs.Companies;

public class CompanyProfileDto
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";

    public string? Website { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }

    public string? LogoUrl { get; set; }
    public string? Location { get; set; }
    public string? Size { get; set; }
    public bool IsActive { get; set; }

    public string? TechStack { get; set; }

    public string? LinkedInUrl { get; set; }
    public string? TwitterUrl { get; set; }
    public string? GitHubUrl { get; set; }

    public int JobsCount { get; set; }
    public List<CompanyJobMiniDto> Jobs { get; set; } = new();
}
