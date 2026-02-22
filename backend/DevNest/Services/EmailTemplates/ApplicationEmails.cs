using System.Net;
using System.Text;


//will use html for email templates, so we can have better formatting and styling
namespace DevNest.EmailTemplates
{
    public static class ApplicationEmails
    {
        public static (string Subject, string Html) ThanksForApplying(
            string applicantFirstName,
            string jobTitle,
            string companyName)
        {
            var safeName = WebUtility.HtmlEncode(applicantFirstName ?? "");
            var safeJob = WebUtility.HtmlEncode(jobTitle ?? "позицията");
            var safeCompany = WebUtility.HtmlEncode(companyName ?? "компанията");

            var subject = $"Благодарим за кандидатурата – {safeJob}";

            var html = $@"
<!doctype html>
<html>
<head>
  <meta charset=""utf-8"" />
  <meta name=""viewport"" content=""width=device-width, initial-scale=1"" />
</head>
<body style=""margin:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#111827;"">
  <div style=""max-width:640px;margin:0 auto;padding:24px;"">
    <div style=""background:#ffffff;border-radius:16px;padding:24px;box-shadow:0 10px 30px rgba(0,0,0,.06);"">
      <h1 style=""margin:0 0 12px;font-size:28px;line-height:1.2;color:#2f52ff;"">DevNest</h1>

      <p style=""margin:0 0 14px;font-size:16px;line-height:1.6;"">
        Здравей{(string.IsNullOrWhiteSpace(safeName) ? "!" : $", {safeName}!")}
      </p>

      <p style=""margin:0 0 14px;font-size:16px;line-height:1.6;"">
        Благодарим ти, че кандидатства за <b>{safeJob}</b> в <b>{safeCompany}</b>.
      </p>

      <div style=""background:#f3f6ff;border-radius:12px;padding:14px;margin:16px 0;"">
        <p style=""margin:0;font-size:14px;line-height:1.6;color:#374151;"">
          Получихме кандидатурата ти и тя ще бъде прегледана от работодателя.
          Ако профилът ти съвпада с изискванията, ще се свържат с теб.
        </p>
      </div>

      <p style=""margin:0 0 8px;font-size:14px;line-height:1.6;color:#6b7280;"">
        Успех!<br/>Екипът на DevNest
      </p>

      <hr style=""border:none;border-top:1px solid #e5e7eb;margin:18px 0;"" />

      <p style=""margin:0;font-size:12px;line-height:1.6;color:#9ca3af;"">
        Това е автоматично съобщение. Моля не отговаряй директно на този имейл.
      </p>
    </div>
  </div>
</body>
</html>";

            return (subject, html);
        }
    }
}