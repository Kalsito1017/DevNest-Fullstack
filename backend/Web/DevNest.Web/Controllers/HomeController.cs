
using Microsoft.AspNetCore.Mvc;
using System;

namespace DevNest.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HomeController : ControllerBase
    {
        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new
            {
                message = "API is working!",
                timestamp = DateTime.UtcNow,
                environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
            });
        }

        [HttpGet("check-auth")]
        public IActionResult CheckAuth()
        {
            var isAuthenticated = User.Identity?.IsAuthenticated ?? false;
            return Ok(new
            {
                isAuthenticated = isAuthenticated,
                userName = User.Identity?.Name,
                authenticationType = User.Identity?.AuthenticationType
            });
        }
    }
}