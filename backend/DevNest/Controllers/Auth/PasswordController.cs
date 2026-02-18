using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Text.Encodings.Web;
using DevNest.DTOs.Auth;

namespace DevNest.Controllers;

[ApiController]
[Route("api/auth")]
public class PasswordController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly BrevoEmailService _emailSvc;
    private readonly IConfiguration _cfg;

    public PasswordController(UserManager<ApplicationUser> userManager, BrevoEmailService emailSvc, IConfiguration cfg)
    {
        _userManager = userManager;
        _emailSvc = emailSvc;
        _cfg = cfg;
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        var email = (dto.Email ?? "").Trim();
        if (string.IsNullOrWhiteSpace(email))
            return BadRequest(new { message = "Email is required." });

        var user = await _userManager.FindByEmailAsync(email);

        // Anti-enumeration: always OK
        if (user == null)
            return Ok(new { ok = true });

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);

        // e.g. appsettings: Frontend:BaseUrl = http://localhost:5173
        var feBase = _cfg["Frontend:BaseUrl"];
        if (string.IsNullOrWhiteSpace(feBase))
            return StatusCode(500, new { message = "Frontend BaseUrl is not configured." });

        var url =
            $"{feBase}/reset-password?email={Uri.EscapeDataString(email)}&token={Uri.EscapeDataString(token)}";

        var safeUrl = HtmlEncoder.Default.Encode(url);

        await _emailSvc.SendAsync(
            toEmail: email,
            toName: user.UserName ?? email,
            subject: "Reset your password",
            htmlBody: $"<p>Click to reset your password:</p><p><a href=\"{safeUrl}\">Reset password</a></p>",
            replyToEmail: null,
            replyToName: null
        );

        return Ok(new { ok = true });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        var email = (dto.Email ?? "").Trim();
        if (string.IsNullOrWhiteSpace(email) ||
            string.IsNullOrWhiteSpace(dto.Token) ||
            string.IsNullOrWhiteSpace(dto.NewPassword))
            return BadRequest(new { message = "Email, Token, NewPassword are required." });

        var user = await _userManager.FindByEmailAsync(email);

        // Anti-enumeration: still return OK even if user not found
        if (user == null)
            return Ok(new { ok = true });

        var result = await _userManager.ResetPasswordAsync(user, dto.Token, dto.NewPassword);
        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                message = "Reset password failed.",
                errors = result.Errors.Select(e => e.Description).ToArray()
            });
        }

        return Ok(new { ok = true });
    }
}
