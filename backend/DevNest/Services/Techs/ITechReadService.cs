namespace DevNest.Services.Techs
{
    
    using DevNest.DTOs.Techs;

    public interface ITechReadService
    {
        Task<IReadOnlyList<TechCardDto>> GetAllAsync(CancellationToken ct = default);
        Task<TechCardDto?> GetBySlugAsync(string slug, CancellationToken ct = default);
    }
}
