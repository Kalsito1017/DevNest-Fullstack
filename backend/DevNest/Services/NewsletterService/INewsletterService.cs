using System.Threading;

namespace DevNest.Services.Newsletter
{
    public interface INewsletterService
    {
        Task SubscribeAsync(string email, CancellationToken ct = default);
    }
}