namespace DevNest.EmailTemplates
{
    public static class NewsletterEmailTemplates
    {
        public static string SubscriptionSuccessSubject =>
            "Успешно се абонира за бюлетина на DEVNEST.BG";

        public static string SubscriptionSuccessHtml(string email)
        {
            return $@"
<!DOCTYPE html>
<html lang=""bg"">
<head>
<meta charset=""UTF-8"">
<meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
</head>
<body style=""margin:0;padding:0;background:#f5f7fa;font-family:Arial,sans-serif;"">

<table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""padding:40px 0;background:#f5f7fa;"">
<tr>
<td align=""center"">

<table width=""600"" cellpadding=""0"" cellspacing=""0"" 
style=""background:#ffffff;border-radius:12px;overflow:hidden;
box-shadow:0 8px 24px rgba(0,0,0,0.05);"">

<tr>
<td align=""center"" style=""background:#2f52ff;padding:28px;"">
<h1 style=""color:#ffffff;margin:0;font-size:22px;"">
DEVNEST.BG
</h1>
</td>
</tr>

<tr>
<td style=""padding:40px 30px;color:#333;font-size:16px;line-height:1.6;"">

<h2 style=""margin-top:0;font-size:20px;"">
Успешно абониране 🎉
</h2>

<p>Здравей,</p>

<p>
Имейл адресът <strong>{System.Net.WebUtility.HtmlEncode(email)}</strong>
беше успешно добавен към месечния бюлетин на <strong>DEVNEST.BG</strong>.
</p>

<p>Ще получаваш:</p>

<ul style=""padding-left:18px;"">
<li>Нови IT обяви</li>
<li>Технологични тенденции</li>
<li>Събития и конференции</li>
<li>Подбрано съдържание от IT общността</li>
</ul>

<p style=""margin-top:25px;"">
Ако не си направил тази заявка, можеш спокойно да игнорираш това съобщение.
</p>

<p style=""margin-top:30px;"">
Поздрави,<br/>
<strong>Екипът на DevNest</strong>
</p>

</td>
</tr>

<tr>
<td align=""center"" style=""padding:18px;font-size:12px;color:#888;background:#f0f2f5;"">
© {DateTime.UtcNow.Year} DevNest. Всички права запазени.
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>";
        }
    }
}