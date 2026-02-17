using DevNest.DTOs.Auth;
using Microsoft.AspNetCore.Identity;
using System.Text.Encodings.Web;

public static class AuthEmailEndpoints
{
    public static IEndpointRouteBuilder MapAuthEmailEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/forgot-password",
            async (
                ForgotPasswordDto dto,
                UserManager<ApplicationUser> userManager,
                BrevoEmailService emailSvc,
                IConfiguration cfg
            ) =>
            {
                // винаги връщаме OK (не издаваме дали имейлът съществува)
                var user = await userManager.FindByEmailAsync(dto.Email);
                if (user is null || !(await userManager.IsEmailConfirmedAsync(user)))
                    return Results.Ok(new { ok = true });

                var token = await userManager.GeneratePasswordResetTokenAsync(user);

                // frontend url: примерно https://devnest.bg/reset-password
                var feBase = cfg["FrontEnd:BaseUrl"]?.TrimEnd('/')
                            ?? "http://localhost:5173";

                var link =
                    $"{feBase}/reset-password?email={Uri.EscapeDataString(dto.Email)}&token={Uri.EscapeDataString(token)}";

                var subject = "Промяна на парола (DevNest)";
                var safeEmail = HtmlEncoder.Default.Encode(dto.Email);

                var html = $@"
<p>Някой е поискал промяна на паролата за следния потребител:</p>
<p><b>Електронна поща:</b> {safeEmail}</p>
<p>If this was a mistake, just ignore this email and nothing will happen.</p>
<p>Посетете този адрес за да промените паролата си:</p>
<p><a href=""{HtmlEncoder.Default.Encode(link)}"">{HtmlEncoder.Default.Encode(link)}</a></p>
";

                await emailSvc.SendAsync(
                    toEmail: dto.Email,
                    toName: user.UserName ?? dto.Email,
                    subject: subject,
                    htmlBody: html
                );

                return Results.Ok(new { ok = true });
            });

        app.MapPost("/api/auth/reset-password",
            async (
                ResetPasswordDto dto,
                UserManager<IdentityUser> userManager
            ) =>
            {
                var user = await userManager.FindByEmailAsync(dto.Email);
                if (user is null)
                    return Results.BadRequest(new { message = "Невалидни данни." });

                var res = await userManager.ResetPasswordAsync(user, dto.Token, dto.NewPassword);
                if (!res.Succeeded)
                {
                    var errors = res.Errors.Select(e => e.Description).ToArray();
                    return Results.BadRequest(new { message = "Reset failed.", errors });
                }

                return Results.Ok(new { ok = true });
            });

        return app;
    }
}