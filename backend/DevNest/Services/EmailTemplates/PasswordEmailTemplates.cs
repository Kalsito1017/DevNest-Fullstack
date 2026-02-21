namespace DevNest.Services.EmailTemplates;

//will use html for email templates, so we can have better formatting and styling

public static class PasswordEmailTemplates
{
    public static string ResetPassword(string safeUrl)
    {
        return $@"
<!DOCTYPE html>
<html lang=""bg"">
<head>
  <meta charset=""UTF-8"" />
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
</head>
<body style=""margin:0;padding:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;"">

  <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:#f6f7fb;padding:30px 16px;"">
    <tr>
      <td align=""center"">
        <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""max-width:600px;background:#ffffff;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.08);padding:24px;"">

          <tr>
            <td align=""center"" style=""font-size:28px;font-weight:900;color:#2d4cff;padding-bottom:10px;"">
              DevNest
            </td>
          </tr>

          <tr>
            <td style=""font-size:14px;color:#5b6472;line-height:1.6;padding-bottom:20px;"">
              Получихме заявка за възстановяване на паролата.
              Натиснете бутона по-долу, за да зададете нова парола.
            </td>
          </tr>

          <tr>
            <td align=""center"" style=""padding-bottom:24px;"">
              <a href=""{safeUrl}"" 
                 style=""display:inline-block;background:#2d4cff;color:#ffffff;
                        text-decoration:none;font-weight:700;font-size:14px;
                        padding:12px 20px;border-radius:8px;"">
                Възстановяване на парола
              </a>
            </td>
          </tr>

          <tr>
            <td style=""font-size:12px;color:#888;line-height:1.5;border-top:1px solid #eee;padding-top:16px;"">
              Ако не сте поискали смяна на парола, игнорирайте този имейл.
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