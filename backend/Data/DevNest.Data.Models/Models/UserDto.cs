namespace DevNest.Services
{
    using System;
    using System.Collections.Generic;
    using System.Text;

    public class UserDto
    {
        public string Id { get; set; }

        public string Email { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string UserName { get; set; }

        public DateTime CreatedOn { get; set; }

        public List<string> Roles { get; set; } = new();
    }
}
