using DevNest.EmailTemplates;
using DevNest.Services.Email;

namespace DevNest.Services.Newsletter
{
    public class NewsletterService : INewsletterService
    {
        private readonly BrevoEmailService _email;
        private readonly IConfiguration _cfg;

        public NewsletterService(BrevoEmailService email, IConfiguration cfg)
        {
            _email = email;
            _cfg = cfg;
        }

        public async Task SubscribeAsync(string email, CancellationToken ct = default)
        {
            email = (email ?? "").Trim();
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("Email is required.", nameof(email));

            // Brevo rejects missing/empty "to.name" in your case -> use email as fallback name
            var subscriberName = email;

            // Confirmation email to subscriber
            await _email.SendAsync(
                toEmail: email,
                toName: subscriberName,
                subject: NewsletterEmailTemplates.SubscriptionSuccessSubject,
                htmlBody: NewsletterEmailTemplates.SubscriptionSuccessHtml(email),
                replyToEmail: _cfg["Brevo:SenderEmail"], // optional
                replyToName: _cfg["Brevo:SenderName"],  // optional
                ct: ct
            );

            // Optional: notify admin inbox (if configured)
            var inbox = (_cfg["Contact:InboxEmail"] ?? "").Trim();
            if (!string.IsNullOrWhiteSpace(inbox))
            {
                var inboxName = (_cfg["Contact:InboxName"] ?? "").Trim();
                if (string.IsNullOrWhiteSpace(inboxName))
                    inboxName = inbox; // fallback to email to avoid empty name

                var adminSubject = "New newsletter subscription";
                var adminHtml = $@"
<!DOCTYPE html>
<html>
<body style=""font-family:Arial,sans-serif;line-height:1.6"">
  <p><b>New newsletter subscriber</b></p>
  <p>Email: <b>{System.Net.WebUtility.HtmlEncode(email)}</b></p>
  <p>Time (UTC): {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}</p>
</body>
</html>";

                await _email.SendAsync(
                    toEmail: inbox,
                    toName: inboxName,
                    subject: adminSubject,
                    htmlBody: adminHtml,
                    replyToEmail: _cfg["Brevo:SenderEmail"],
                    replyToName: _cfg["Brevo:SenderName"],
                    ct: ct
                );
            }
        }
    }
}