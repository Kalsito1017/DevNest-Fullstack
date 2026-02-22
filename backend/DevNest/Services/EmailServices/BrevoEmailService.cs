using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace DevNest.Services.Email
{
    public class BrevoEmailService
    {
        private readonly HttpClient _http;
        private readonly IConfiguration _cfg;

        public BrevoEmailService(HttpClient http, IConfiguration cfg)
        {
            _http = http;
            _cfg = cfg;
        }

        public async Task SendAsync(
            string toEmail,
            string toName,
            string subject,
            string htmlBody,
            string? replyToEmail = null,
            string? replyToName = null,
            CancellationToken ct = default)
        {
            var apiKey = _cfg["Brevo:ApiKey"];
            if (string.IsNullOrWhiteSpace(apiKey))
                throw new InvalidOperationException("Brevo API key is missing. Configure Brevo:ApiKey.");

            var senderEmail = _cfg["Brevo:SenderEmail"] ?? "no-reply@devnest.bg";
            var senderName = _cfg["Brevo:SenderName"] ?? "DevNest";

            // Optional: keep a single base address set in DI; if not, this still works.
            var url = "https://api.brevo.com/v3/smtp/email";

            using var req = new HttpRequestMessage(HttpMethod.Post, url);

            req.Headers.Accept.Clear();
            req.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            // Brevo expects this header name exactly
            req.Headers.Remove("api-key");
            req.Headers.Add("api-key", apiKey);

            var payload = new Dictionary<string, object?>
            {
                ["sender"] = new { email = senderEmail, name = senderName },
                ["to"] = new[] { new { email = toEmail, name = toName } },
                ["subject"] = subject,
                ["htmlContent"] = htmlBody
            };

            if (!string.IsNullOrWhiteSpace(replyToEmail))
            {
                payload["replyTo"] = new
                {
                    email = replyToEmail,
                    name = string.IsNullOrWhiteSpace(replyToName) ? replyToEmail : replyToName
                };
            }

            var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions
            {
                PropertyNamingPolicy = null
            });

            req.Content = new StringContent(json, Encoding.UTF8, "application/json");

            using var res = await _http.SendAsync(req, ct);
            var resBody = await res.Content.ReadAsStringAsync(ct);

            if (!res.IsSuccessStatusCode)
                throw new InvalidOperationException($"Brevo send failed: {(int)res.StatusCode} {resBody}");
        }
    }
}