using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace DevNest.Services.Email
{
    public class BrevoEmailService
    {
        private const string SendUrl = "https://api.brevo.com/v3/smtp/email";

        private readonly HttpClient _http;
        private readonly IConfiguration _cfg;

        public BrevoEmailService(HttpClient http, IConfiguration cfg)
        {
            _http = http;
            _cfg = cfg;
        }

        private (string ApiKey, string SenderEmail, string SenderName) GetConfig()
        {
            var apiKey = _cfg["Brevo:ApiKey"];
            if (string.IsNullOrWhiteSpace(apiKey))
                throw new InvalidOperationException("Brevo API key is missing. Configure Brevo:ApiKey.");

            var senderEmail = _cfg["Brevo:SenderEmail"] ?? "no-reply@devnest.bg";
            var senderName = _cfg["Brevo:SenderName"] ?? "DevNest";

            return (apiKey, senderEmail, senderName);
        }

        private HttpRequestMessage BuildRequest(string apiKey, object payload)
        {
            var req = new HttpRequestMessage(HttpMethod.Post, SendUrl);

            req.Headers.Accept.Clear();
            req.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            // Brevo expects this header name exactly
            req.Headers.Remove("api-key");
            req.Headers.Add("api-key", apiKey);

            var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions
            {
                PropertyNamingPolicy = null
            });

            req.Content = new StringContent(json, Encoding.UTF8, "application/json");
            return req;
        }

        private static object BuildReplyTo(string replyToEmail, string? replyToName)
        {
            return new
            {
                email = replyToEmail,
                name = string.IsNullOrWhiteSpace(replyToName) ? replyToEmail : replyToName
            };
        }

        private async Task SendPayloadAsync(object payload, CancellationToken ct)
        {
            var (apiKey, _, _) = GetConfig();

            using var req = BuildRequest(apiKey, payload);
            using var res = await _http.SendAsync(req, ct);
            var resBody = await res.Content.ReadAsStringAsync(ct);

            if (!res.IsSuccessStatusCode)
                throw new InvalidOperationException($"Brevo send failed: {(int)res.StatusCode} {resBody}");
        }

        /// <summary>
        /// Send transactional email with HTML content.
        /// NOTE: Brevo can reject empty "to.name". If toName is blank, we set it to the email.
        /// </summary>
        public async Task SendAsync(
            string toEmail,
            string toName,
            string subject,
            string htmlBody,
            string? replyToEmail = null,
            string? replyToName = null,
            CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(toEmail))
                throw new ArgumentException("toEmail is required.", nameof(toEmail));

            if (string.IsNullOrWhiteSpace(toName))
                toName = toEmail;

            var (_, senderEmail, senderName) = GetConfig();

            var payload = new Dictionary<string, object?>
            {
                ["sender"] = new { email = senderEmail, name = senderName },
                ["to"] = new[] { new { email = toEmail, name = toName } },
                ["subject"] = subject,
                ["htmlContent"] = htmlBody
            };

            if (!string.IsNullOrWhiteSpace(replyToEmail))
                payload["replyTo"] = BuildReplyTo(replyToEmail, replyToName);

            await SendPayloadAsync(payload, ct);
        }

        /// <summary>
        /// Send transactional email with plain text content.
        /// NOTE: Brevo can reject empty "to.name". If toName is blank, we set it to the email.
        /// </summary>
        public async Task SendTextAsync(
            string toEmail,
            string toName,
            string subject,
            string textBody,
            string? replyToEmail = null,
            string? replyToName = null,
            CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(toEmail))
                throw new ArgumentException("toEmail is required.", nameof(toEmail));

            if (string.IsNullOrWhiteSpace(toName))
                toName = toEmail;

            var (_, senderEmail, senderName) = GetConfig();

            var payload = new Dictionary<string, object?>
            {
                ["sender"] = new { email = senderEmail, name = senderName },
                ["to"] = new[] { new { email = toEmail, name = toName } },
                ["subject"] = subject,
                ["textContent"] = textBody
            };

            if (!string.IsNullOrWhiteSpace(replyToEmail))
                payload["replyTo"] = BuildReplyTo(replyToEmail, replyToName);

            await SendPayloadAsync(payload, ct);
        }

        /// <summary>
        /// Send transactional email using a Brevo template (templateId + params).
        /// NOTE: Brevo can reject empty "to.name". If toName is blank, we set it to the email.
        /// </summary>
        public async Task SendTemplateAsync(
            string toEmail,
            string toName,
            int templateId,
            object? parameters = null,
            string? replyToEmail = null,
            string? replyToName = null,
            CancellationToken ct = default)
        {
            if (templateId <= 0)
                throw new ArgumentOutOfRangeException(nameof(templateId), "TemplateId must be > 0.");

            if (string.IsNullOrWhiteSpace(toEmail))
                throw new ArgumentException("toEmail is required.", nameof(toEmail));

            if (string.IsNullOrWhiteSpace(toName))
                toName = toEmail;

            var (_, senderEmail, senderName) = GetConfig();

            var payload = new Dictionary<string, object?>
            {
                ["sender"] = new { email = senderEmail, name = senderName },
                ["to"] = new[] { new { email = toEmail, name = toName } },
                ["templateId"] = templateId,
                ["params"] = parameters ?? new { }
            };

            if (!string.IsNullOrWhiteSpace(replyToEmail))
                payload["replyTo"] = BuildReplyTo(replyToEmail, replyToName);

            await SendPayloadAsync(payload, ct);
        }
    }
}