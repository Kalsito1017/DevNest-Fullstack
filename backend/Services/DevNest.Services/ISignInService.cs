namespace DevNest.Services
{
    using System;
    using System.Collections.Generic;
    using System.Text;
    using System.Threading.Tasks;

    using DevNest.Data.Models;

    public interface ISignInService
    {
       public Task SignInAsync(ApplicationUser user, bool rememberMe);

       public Task SignOutAsync();

       public Task<string> GetCurrentUserIdAsync();

       public Task<bool> IsUserAuthenticatedAsync();
    }
}
