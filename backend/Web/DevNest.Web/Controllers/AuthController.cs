// Controllers/Api/AuthController.cs
namespace DevNest.Web.Controllers.Api
{
    using System;
    using System.Linq;
    using System.Security.Claims;
    using System.Threading.Tasks;

    using DevNest.Data;
    using DevNest.Data.Models;
    using DevNest.Models;
    using Microsoft.AspNetCore.Authentication;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Logging;

    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            ApplicationDbContext context,
            ILogger<AuthController> logger)
        {
            _userManager = userManager;
            _context = context;
            _logger = logger;
        }

        // POST: api/auth/register
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                var user = new ApplicationUser
                {

                    FirstName = registerDto.FirstName,
                    LastName = registerDto.LastName,
                    Email = registerDto.Email,
                };
                var createResult = await _userManager.CreateAsync(user, registerDto.Password);
                if (createResult.Succeeded)
                {
                    var roleResult = await _userManager.AddToRoleAsync(user, "User");
                    if (!roleResult.Succeeded)
                    {
                        return BadRequest(roleResult.Errors);
                    }
                    else
                    {
                        return Ok("User Created");
                    }
                }
                else
                {
                    return StatusCode(500, createResult.Errors);
                }

            }
            catch (Exception ex)
            {

                return StatusCode(500, ex.Message);
            }
        }

        // POST: api/auth/login
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                _logger.LogInformation("🔐 Login attempt for email: {Email}", loginDto.Email);

                // Validate model using DTO annotations
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();

                    return BadRequest(new
                    {
                        success = false,
                        message = "Validation failed",
                        errors
                    });
                }

                // Find user by email
                var user = await _userManager.FindByEmailAsync(loginDto.Email);
                if (user == null)
                {
                    _logger.LogWarning("❌ Login failed - user not found: {Email}", loginDto.Email);
                    return BadRequest(new
                    {
                        success = false,
                        message = "Invalid email or password."
                    });
                }

                // Check password
                var isPasswordValid = await _userManager.CheckPasswordAsync(user, loginDto.Password);
                if (!isPasswordValid)
                {
                    _logger.LogWarning("❌ Login failed - invalid password for: {Email}", loginDto.Email);
                    return BadRequest(new
                    {
                        success = false,
                        message = "Invalid email or password."
                    });
                }

                // Sign in the user
                await SignInUserAsync(user, loginDto.RememberMe);

                // Get user profile
                var userProfile = await _context.UserProfiles
                    .FirstOrDefaultAsync(p => p.UserId == user.Id);

                _logger.LogInformation("✅ Login successful for: {Email}", user.Email);

                return Ok(new
                {
                    success = true,
                    message = "Login successful",
                    user = new
                    {
                        user.Id,
                        user.Email,
                        user.FirstName,
                        user.LastName,
                        user.UserName
                    },
                    profile = userProfile != null ? new
                    {
                        userProfile.Id,
                        userProfile.FirstName,
                        userProfile.LastName,
                        userProfile.Email,
                        userProfile.CreatedOn
                    } : null
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error during login");
                return StatusCode(500, new
                {
                    success = false,
                    message = "An error occurred during login."
                });
            }
        }

        // POST: api/auth/logout
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            try
            {
                await HttpContext.SignOutAsync("Identity.Application");
                _logger.LogInformation("👋 User logged out");

                return Ok(new
                {
                    success = true,
                    message = "Logged out successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error during logout");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Logout failed"
                });
            }
        }

        // GET: api/auth/me
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                // Get user ID from claims
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new
                    {
                        success = false,
                        message = "Not authenticated"
                    });
                }

                // Find user by ID
                var user = await _userManager.FindByIdAsync(userId);

                if (user == null)
                {
                    return Unauthorized(new
                    {
                        success = false,
                        message = "User not found"
                    });
                }

                // Get user profile
                var userProfile = await _context.UserProfiles
                    .FirstOrDefaultAsync(p => p.UserId == userId);

                return Ok(new
                {
                    success = true,
                    user = new
                    {
                        user.Id,
                        user.Email,
                        user.FirstName,
                        user.LastName,
                        user.UserName,
                        user.CreatedOn
                    },
                    profile = userProfile != null ? new
                    {
                        userProfile.Id,
                        userProfile.FirstName,
                        userProfile.LastName,
                        userProfile.Email,
                        userProfile.CreatedOn,
                        userProfile.ModifiedOn
                    } : null
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error getting current user");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Failed to get user info"
                });
            }
        }

        // GET: api/auth/check
        [HttpGet("check")]
        [AllowAnonymous]
        public async Task<IActionResult> CheckAuth()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var isAuthenticated = !string.IsNullOrEmpty(userId);

                ApplicationUser user = null;
                UserProfile profile = null;

                if (isAuthenticated)
                {
                    user = await _userManager.FindByIdAsync(userId);
                    if (user != null)
                    {
                        profile = await _context.UserProfiles
                            .FirstOrDefaultAsync(p => p.UserId == userId);
                    }
                }

                return Ok(new
                {
                    authenticated = isAuthenticated,
                    user = user != null ? new
                    {
                        user.Id,
                        user.Email,
                        user.FirstName,
                        user.LastName
                    } : null,
                    profile = profile != null ? new
                    {
                        profile.Id,
                        profile.FirstName,
                        profile.LastName,
                        profile.Email
                    } : null,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error checking auth");
                return Ok(new
                {
                    authenticated = false,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        // GET: api/auth/exists/{email}
        [HttpGet("exists/{email}")]
        [AllowAnonymous]
        public async Task<IActionResult> CheckUserExists(string email)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(email);
                var exists = user != null;

                _logger.LogInformation("🔍 User exists check for {Email}: {Exists}", email, exists);

                return Ok(new { exists });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error checking user existence");
                return Ok(new { exists = false });
            }
        }

        // Helper method to sign in user
        private async Task SignInUserAsync(ApplicationUser user, bool rememberMe)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim("FirstName", user.FirstName ?? ""),
                new Claim("LastName", user.LastName ?? "")
            };

            var identity = new ClaimsIdentity(claims, "Identity.Application");
            var principal = new ClaimsPrincipal(identity);

            await HttpContext.SignInAsync(
                "Identity.Application",
                principal,
                new AuthenticationProperties
                {
                    IsPersistent = rememberMe,
                    ExpiresUtc = rememberMe ? DateTimeOffset.UtcNow.AddDays(30) : null
                });
        }

        // GET: api/auth/test
        [HttpGet("test")]
        [AllowAnonymous]
        public IActionResult Test()
        {
            return Ok(new
            {
                message = "Auth API is working",
                authenticated = User.Identity?.IsAuthenticated ?? false,
                username = User.Identity?.Name,
                timestamp = DateTime.UtcNow
            });
        }
    }
}