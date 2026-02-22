using System.Net;

namespace DevNest.EmailTemplates;

public static class SavedEventEmails
{
    public static (string Subject, string Html) SeatReserved(
        string? firstName,
        string? eventTitle,
        string? whenText)
    {
        var safeName = WebUtility.HtmlEncode(firstName ?? "");
        var safeTitle = WebUtility.HtmlEncode(eventTitle ?? "Workshop");
        var safeWhen = WebUtility.HtmlEncode(whenText ?? "—");

        var subject = $"Запазено място: {eventTitle}";

        var html = $@"
<!doctype html>
<html>
<body style='font-family:Arial,Helvetica,sans-serif;background:#f5f7fb;padding:24px;'>
  <div style='max-width:640px;margin:0 auto;background:#fff;border-radius:16px;padding:24px;box-shadow:0 10px 30px rgba(0,0,0,.06);'>
    <h1 style='margin:0 0 12px;font-size:28px;color:#2f52ff;'>DevNest</h1>

    <p style='margin:0 0 12px;font-size:16px;'>
      Здравей{(string.IsNullOrWhiteSpace(safeName) ? "!" : $", {safeName}!")}
    </p>

    <p style='margin:0 0 12px;font-size:16px;line-height:1.6;'>
      Успешно запази място за <b>{safeTitle}</b>.
    </p>

    <p style='margin:0 0 12px;font-size:14px;line-height:1.6;color:#374151;'>
      Дата: <b>{safeWhen}</b>
    </p>

    <hr style='border:none;border-top:1px solid #e5e7eb;margin:18px 0;' />
    <p style='margin:0;font-size:12px;color:#9ca3af;'>
      Това е автоматично съобщение. Моля, не отговаряй на този имейл.
    </p>
  </div>
</body>
</html>";

        return (subject, html);
    }
}