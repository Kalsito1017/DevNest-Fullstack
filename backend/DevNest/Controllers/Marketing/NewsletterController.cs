using DevNest.DTOs;
using DevNest.Services.Newsletter;
using Microsoft.AspNetCore.Mvc;

namespace DevNest.Controllers
{
    [ApiController]
    [Route("api/newsletter")]
    public class NewsletterController : ControllerBase
    {
        private readonly INewsletterService _svc;

        public NewsletterController(INewsletterService svc)
        {
            _svc = svc;
        }

        [HttpPost("subscribe")]
        public async Task<IActionResult> Subscribe([FromBody] NewsletterSubscribeDto dto, CancellationToken ct)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            var email = (dto.Email ?? "").Trim();
            await _svc.SubscribeAsync(email, ct);

            return NoContent();
        }
    }
}