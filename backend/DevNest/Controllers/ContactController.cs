using DevNest.DTOs; // adjust if ContactEmailDto is in another namespace
using Microsoft.AspNetCore.Mvc;
using System.Text.Encodings.Web;

namespace DevNest.Controllers
{
    [ApiController]
    [Route("api/contact")]
    public class ContactController : ControllerBase
    {
        private readonly BrevoEmailService _emailSvc;
        private readonly IConfiguration _cfg;

        public ContactController(BrevoEmailService emailSvc, IConfiguration cfg)
        {
            _emailSvc = emailSvc;
            _cfg = cfg;
        }

        [HttpPost("email")]
        public async Task<IActionResult> SendContactEmail([FromBody] ContactEmailDto dto)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            // Where do you want to receive contact emails?
            // appsettings: Contact:InboxEmail, Contact:InboxName
            var inboxEmail = _cfg["Contact:InboxEmail"];
            var inboxName = _cfg["Contact:InboxName"] ?? "DevNest Support";

            if (string.IsNullOrWhiteSpace(inboxEmail))
                return StatusCode(500, new { message = "Contact inbox email is not configured." });

            var fromEmail = dto.Email.Trim();
            var fromName = string.IsNullOrWhiteSpace(dto.Name) ? fromEmail : dto.Name.Trim();
            var subject = dto.Subject.Trim();
            var message = dto.Message.Trim();

            // Basic hardening against HTML injection in the email body
            var safeFromEmail = HtmlEncoder.Default.Encode(fromEmail);
            var safeFromName = HtmlEncoder.Default.Encode(fromName);
            var safeSubject = HtmlEncoder.Default.Encode(subject);
            var safeMessage = HtmlEncoder.Default.Encode(message).Replace("\n", "<br/>");

            var html = $@"
<h3>New contact message (DevNest)</h3>
<p><b>From:</b> {safeFromName} &lt;{safeFromEmail}&gt;</p>
<p><b>Subject:</b> {safeSubject}</p>
<hr/>
<p>{safeMessage}</p>
";

            // Send to your inbox, but set Reply-To to the user's email
            await _emailSvc.SendAsync(
                toEmail: inboxEmail,
                toName: inboxName,
                subject: $"[Contact] {subject}",
                htmlBody: html,
                replyToEmail: fromEmail,
                replyToName: fromName
            );

            return Ok(new { ok = true });
        }
    }
}