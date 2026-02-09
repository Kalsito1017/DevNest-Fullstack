using DevNest.DTOs.Home;

namespace DevNest.Services.Home
{
    public interface IHomeSectionsService
    {
        Task<IReadOnlyList<HomeSectionDto>> GetSectionsAsync(
         int takeTechs,
         string? location = null,
          bool remote = false,
         CancellationToken ct = default);


    }
}
