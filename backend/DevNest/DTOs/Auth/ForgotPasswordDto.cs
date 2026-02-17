namespace DevNest.DTOs.Auth
{
    public record ForgotPasswordDto(string Email);
    public record ResetPasswordDto(string Email, string Token, string NewPassword);

}
