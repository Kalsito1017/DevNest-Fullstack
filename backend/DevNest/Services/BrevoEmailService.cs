using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

public class BrevoEmailService
{
    private readonly HttpClient _http;
    private readonly IConfiguration _cfg;

    public BrevoEmailService(HttpClient http, IConfiguration cfg)
    {
        _http = http;
        _cfg = cfg;
    }

    public async Task SendAsync(string toEmail, string toName, string subject, string htmlBody)
    {
        var apiKey = _cfg["Brevo:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
            throw new InvalidOperationException("Brevo API key is missing.");

        var senderEmail = _cfg["Brevo:SenderEmail"] ?? "no-reply@devnest.bg";
        var senderName = _cfg["Brevo:SenderName"] ?? "DevNest";

        // Brevo Transactional endpoint
        var url = "https://api.brevo.com/v3/smtp/email";

        using var req = new HttpRequestMessage(HttpMethod.Post, url);
        req.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        req.Headers.Add("api-key", apiKey);

        var payload = new
        {
            sender = new { email = senderEmail, name = senderName },
            to = new[] { new { email = toEmail, name = toName } },
            subject = subject,
            htmlContent = htmlBody
        };

        var json = JsonSerializer.Serialize(payload);
        req.Content = new StringContent(json, Encoding.UTF8, "application/json");

        using var res = await _http.SendAsync(req);
        var resBody = await res.Content.ReadAsStringAsync();

        if (!res.IsSuccessStatusCode)
            throw new InvalidOperationException($"Brevo send failed: {(int)res.StatusCode} {resBody}");
    }
}