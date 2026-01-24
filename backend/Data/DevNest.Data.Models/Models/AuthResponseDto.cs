// Services/Contracts/Results/AuthResult.cs
namespace DevNest.Services.Contracts.Results
{
    using System;
    using System.Collections.Generic;

    public class AuthResponseDto
    {
        public bool Success { get; set; }

        public string Message { get; set; }

        public UserDto User { get; set; }

        public List<string> Errors { get; set; } = new();
    }
}
