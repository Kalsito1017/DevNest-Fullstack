using Microsoft.AspNetCore.Identity;
//using Microsoft.

public static class AdminSeeder
{
    public static async Task SeedAsync(IServiceProvider services, IConfiguration config)
    {
        using var scope = services.CreateScope();

        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        const string adminRole = "Admin";

        // 1) Ensure role exists
        if (!await roleManager.RoleExistsAsync(adminRole))
            await roleManager.CreateAsync(new IdentityRole(adminRole));

        // 2) Ensure admin user exists
        var adminEmail = config["AdminSeed:Email"];
        var adminPass = config["AdminSeed:Password"];

        if (string.IsNullOrWhiteSpace(adminEmail) || string.IsNullOrWhiteSpace(adminPass))
            return;

        var user = await userManager.FindByEmailAsync(adminEmail);
        if (user == null)
        {
            user = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FirstName = config["AdminSeed:FirstName"],
                LastName = config["AdminSeed:LastName"]
            };

            var createRes = await userManager.CreateAsync(user, adminPass);
            if (!createRes.Succeeded)
                throw new Exception(string.Join("; ", createRes.Errors.Select(e => e.Description)));
        }

        // 3) Ensure user is in Admin role
        if (!await userManager.IsInRoleAsync(user, adminRole))
            await userManager.AddToRoleAsync(user, adminRole);


    }
}
