namespace DevNest.DTOs.JobApplications;

public class MyJobApplicationListItemDto
{
    public int ApplicationId { get; set; }
    public DateTime AppliedAt { get; set; }

    public int JobId { get; set; }
    public string JobTitle { get; set; } = "";

    public int CompanyId { get; set; }
    public string CompanyName { get; set; } = "";

    // FE rule: if false -> disable job link, allow company link
    public bool IsJobActive { get; set; }
}