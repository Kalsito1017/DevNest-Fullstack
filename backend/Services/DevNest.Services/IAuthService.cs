// Services/Contracts/IAuthService.cs
using System;
using System.Threading.Tasks;

using DevNest.Data.Models;
using DevNest.Models;
using DevNest.Services.Contracts.Results;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
    Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
    Task<bool> UserExistsAsync(string email);
    Task<AuthResponseDto> GetUserByIdAsync(string userId);
   
}
