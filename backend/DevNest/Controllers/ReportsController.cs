using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Text.Encodings.Web;

[ApiController]
[Route("api/reports")]
public class ReportsController : ControllerBase
{
    private readonly BrevoEmailService _emailSvc;
    private readonly IConfiguration _cfg;

    public ReportsController(BrevoEmailService emailSvc, IConfiguration cfg)
    {
        _emailSvc = emailSvc;
        _cfg = cfg;
    }

    [EnableRateLimiting("reporting")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReportDto dto)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var inboxEmail = _cfg["Reports:InboxEmail"] ?? _cfg["Contact:InboxEmail"];
        var inboxName = _cfg["Reports:InboxName"] ?? _cfg["Contact:InboxName"] ?? "DevNest Support";

        if (string.IsNullOrWhiteSpace(inboxEmail))
            return Problem("Missing Reports:InboxEmail configuration.");

        var safeDetails = HtmlEncoder.Default.Encode(dto.Details.Trim());
        var safeReason = HtmlEncoder.Default.Encode(dto.Reason);

        // 1) имейл към вас (админите)
        var subject = $"[Report] Problem with job ad ({dto.Reason})";
        var html = $@"
            <h2>New report</h2>
            <p><b>Reason:</b> {safeReason}</p>
            <p><b>Details:</b><br/>{safeDetails.Replace("\n", "<br/>")}</p>
            <p><b>User email:</b> {(string.IsNullOrWhiteSpace(dto.Email) ? "(not provided)" : HtmlEncoder.Default.Encode(dto.Email))}</p>
            <p><b>JobId:</b> {(dto.JobId?.ToString() ?? "(none)")}</p>
            <p><b>PageUrl:</b> {(string.IsNullOrWhiteSpace(dto.PageUrl) ? "(none)" : HtmlEncoder.Default.Encode(dto.PageUrl))}</p>
        ";

        await _emailSvc.SendAsync(
            toEmail: inboxEmail,
            toName: inboxName,
            subject: subject,
            htmlBody: html,
            replyToEmail: string.IsNullOrWhiteSpace(dto.Email) ? null : dto.Email,
            replyToName: null
        );

        // 2) auto-reply към потребителя (ако е дал имейл)
        if (!string.IsNullOrWhiteSpace(dto.Email))
        {
            var replySubject = "Получихме сигнала ти (DevNest)";
            var replyHtml = @"
                <p>Здравей!</p>
                <p>Благодарим ти, че ни писа. Получихме сигнала и ще го прегледаме възможно най-скоро.</p>
                <p>— DevNest</p>
            ";

            await _emailSvc.SendAsync(
                toEmail: dto.Email,
                toName: dto.Email,
                subject: replySubject,
                htmlBody: replyHtml,
                replyToEmail: inboxEmail,
                replyToName: inboxName
            );
        }

        return NoContent(); // 204
    }
}