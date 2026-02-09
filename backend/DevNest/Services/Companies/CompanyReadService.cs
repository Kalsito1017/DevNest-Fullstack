using DevNest.Data;
using DevNest.DTOs.Companies;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace DevNest.Services.Companies
{
    public class CompanyReadService : ICompanyReadService
    {
        private readonly ApplicationDbContext db;

        public CompanyReadService(ApplicationDbContext db) => this.db = db;

        // ----------------------------
        // MAIN: cards for listing page
        // ----------------------------
        public async Task<(int TotalCount, IReadOnlyList<CompanyCardDto> Items)> GetCompanyCardsAsync(
       string? search,
       string sort,
       bool onlyActive,
       string? sizeBucket,
       string? location,
       CancellationToken ct = default)
        {
            var companiesQ = db.Companies.AsNoTracking();

            if (onlyActive)
                companiesQ = companiesQ.Where(c => c.IsActive);

            if (!string.IsNullOrWhiteSpace(search))
                companiesQ = companiesQ.Where(c => c.Name.Contains(search));

            // sizeBucket filter (както си го имал)

            var loc = NormalizeLocation(location);
            if (!string.IsNullOrWhiteSpace(loc))
            {
                // Ако Location е единична стойност ("Sofia")
                companiesQ = companiesQ.Where(c => c.Location == loc);

                // Ако Location понякога е списък "Sofia, Varna" — тогава смени горното с:
                // companiesQ = companiesQ.Where(c =>
                //     c.Location != null && EF.Functions.Like(c.Location, $"%{loc}%"));
            }

            companiesQ = sort switch
            {
                "alpha" => companiesQ.OrderBy(c => c.Name),
                "newest" => companiesQ.OrderByDescending(c => c.CreatedAt),
                _ => companiesQ.OrderBy(_ => Guid.NewGuid()) // random
            };

            // projection към CompanyCardDto (както ти е)

            var items = await companiesQ
                .Select(c => new CompanyCardDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    LogoUrl = c.LogoUrl,
                    Location = c.Location,
                    Size = c.Size,
                    JobsCount = c.Jobs.Count /* както го смяташ */

                })
                .ToListAsync(ct);

            return (items.Count, items);
        }
        private static string? NormalizeLocation(string? location)
        {
            if (string.IsNullOrWhiteSpace(location)) return null;

            var l = location.Trim().ToLowerInvariant();
            return l switch
            {
                "sofia" => "Sofia",
                "varna" => "Varna",
                "plovdiv" => "Plovdiv",
                "burgas" => "Burgas",
                "ruse" => "Ruse",
                "remote" => "Remote",
                _ => null
            };
        }


        // Optional convenience method you already have
        public async Task<IReadOnlyList<CompanyCardDto>> GetAllAsync(bool onlyActive, CancellationToken ct = default)
        {
            var (_, items) = await GetCompanyCardsAsync(
                search: null,
                sort: "alpha",
                onlyActive: onlyActive,
                sizeBucket: null,
                location: null,
                ct: ct);

            return items;
        }

        // ----------------------------
        // Company details
        // ----------------------------
        public async Task<CompanyDetailsDto?> GetByIdAsync(int id, CancellationToken ct = default)
        {
            // If you have navigation Jobs configured, this is fine.
            // If not, switch JobsCount to a separate query (shown below).
            return await db.Companies
                .AsNoTracking()
                .Where(c => c.Id == id)
                .Select(c => new CompanyDetailsDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    Website = c.Website,
                    Email = c.Email,
                    Phone = c.Phone,
                    LogoUrl = c.LogoUrl,
                    Location = c.Location,
                    Size = c.Size,
                    IsActive = c.IsActive,
                    TechStack = c.TechStack,
                    LinkedInUrl = c.LinkedInUrl,
                    TwitterUrl = c.TwitterUrl,
                    GitHubUrl = c.GitHubUrl,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt,
                    JobsCount = c.Jobs.Count(j => j.Status == "Active")
                })
                .FirstOrDefaultAsync(ct);
        }

        // ----------------------------
        // Size stats for filter UI
        // ----------------------------
        public async Task<CompanySizeStatsDto> GetCompanySizeStatsAsync(bool onlyActive, CancellationToken ct = default)
        {
            var companiesQ = db.Companies.AsNoTracking();
            if (onlyActive)
                companiesQ = companiesQ.Where(c => c.IsActive);

            var sizes = await companiesQ.Select(c => c.Size).ToListAsync(ct);

            var stats = new CompanySizeStatsDto();

            foreach (var s in sizes)
            {
                var n = ParseSizeToNumber(s);
                stats.Total++;

                if (n < 10) stats.Micro++;
                else if (n <= 30) stats.Small++;
                else if (n <= 70) stats.Medium++;
                else stats.Large++;
            }

            return stats;
        }

        private static bool IsInBucket(int sizeNumber, string bucket) => bucket switch
        {
            "micro" => sizeNumber < 10,
            "small" => sizeNumber >= 10 && sizeNumber <= 30,
            "medium" => sizeNumber >= 31 && sizeNumber <= 70,
            "large" => sizeNumber > 70,
            _ => true
        };

        private static int ParseSizeToNumber(string? size)
        {
            if (string.IsNullOrWhiteSpace(size))
                return 0;

            var s = size.Trim();
            s = s.Replace("–", "-").Replace("—", "-");

            var dashIndex = s.IndexOf('-');
            if (dashIndex > 0)
            {
                var right = s[(dashIndex + 1)..].Trim();
                if (TryExtractFirstInt(right, out var upper))
                    return upper;

                var left = s[..dashIndex].Trim();
                if (TryExtractFirstInt(left, out var lower))
                    return lower;

                return 0;
            }

            if (TryExtractFirstInt(s, out var n))
                return n;

            return 0;
        }

        private static bool TryExtractFirstInt(string s, out int value)
        {
            value = 0;
            if (string.IsNullOrWhiteSpace(s)) return false;

            var digits = new string(s.Where(char.IsDigit).ToArray());
            if (digits.Length == 0) return false;

            return int.TryParse(digits, NumberStyles.Integer, CultureInfo.InvariantCulture, out value);
        }

        // ----------------------------
        // Location stats for UI
        // ----------------------------
        public async Task<IReadOnlyList<CompanyLocationStatDto>> GetCompanyLocationStatsAsync(bool onlyActive, CancellationToken ct = default)
        {
            var q = db.Companies.AsNoTracking();

            if (onlyActive)
                q = q.Where(c => c.IsActive);

            // Pull minimal data, group in-memory (Location strings can be messy)
            var locations = await q
                .Select(c => c.Location)
                .ToListAsync(ct);

            // Normalize to main cities we care about (extend later)
            static string NormalizeCity(string? loc)
            {
                if (string.IsNullOrWhiteSpace(loc)) return "";

                var s = loc.Trim().ToLowerInvariant();

                if (s.Contains("sofia")) return "Sofia";
                if (s.Contains("plovdiv")) return "Plovdiv";
                if (s.Contains("varna")) return "Varna";
                if (s.Contains("burgas")) return "Burgas";
                if (s.Contains("ruse") || s.Contains("rousse")) return "Ruse";

                // optional: treat remote as a “location”
                if (s.Contains("remote") || s.Contains("fully remote")) return "Remote";

                return ""; // ignore others for now
            }

            static string Slug(string city) => city.ToLowerInvariant();

            var counts = locations
                .Select(NormalizeCity)
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .GroupBy(x => x)
                .Select(g => new CompanyLocationStatDto
                {
                    City = g.Key,
                    Slug = Slug(g.Key),
                    Count = g.Count()
                })
                .OrderByDescending(x => x.Count)
                .ToList();

            return counts;
        }

        // ----------------------------
        // Map data
        // ----------------------------
        public async Task<IReadOnlyList<CompanyMapDto>> GetCompaniesForMapAsync(bool onlyActive, CancellationToken ct = default)
        {
            var companiesQ = db.Companies.AsNoTracking();

            if (onlyActive)
                companiesQ = companiesQ.Where(c => c.IsActive);

            var jobCountsQ = db.Jobs
                .AsNoTracking()
                .Where(j => j.Status == "Active")
                .GroupBy(j => j.CompanyId)
                .Select(g => new { CompanyId = g.Key, JobsCount = g.Count() });

            var q =
                from c in companiesQ
                join jc in jobCountsQ on c.Id equals jc.CompanyId into jcg
                from jc in jcg.DefaultIfEmpty()
                select new CompanyMapDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    LogoUrl = c.LogoUrl,
                    Location = c.Location ?? "",
                    JobsCount = jc == null ? 0 : jc.JobsCount
                };

            return await q
                .Where(x => x.Location != null && x.Location != "")
                .ToListAsync(ct);
        }

        // ----------------------------
        // Suggestions
        // ----------------------------
        public async Task<IReadOnlyList<CompanySuggestDto>> SuggestAsync(
            string? q,
            int take = 8,
            bool onlyActive = true,
            CancellationToken ct = default)
        {
            take = take < 1 ? 8 : Math.Min(take, 20);

            var term = (q ?? string.Empty).Trim();
            if (term.Length == 0) return Array.Empty<CompanySuggestDto>();

            var companiesQ = db.Companies.AsNoTracking();
            if (onlyActive) companiesQ = companiesQ.Where(c => c.IsActive);

            // Active jobs counts
            var jobCountsQ = db.Jobs
                .AsNoTracking()
                .Where(j => j.Status == "Active")
                .GroupBy(j => j.CompanyId)
                .Select(g => new { CompanyId = g.Key, JobsCount = g.Count() });

            // StartsWith first (SEO feel), fallback to Contains in same query:
            // We rank StartsWith higher, then alphabetical.
            var qLower = term.ToLowerInvariant();

            var results =
                from c in companiesQ
                join jc in jobCountsQ on c.Id equals jc.CompanyId into jcg
                from jc in jcg.DefaultIfEmpty()
                let nameLower = c.Name.ToLower()
                where nameLower.StartsWith(qLower) || nameLower.Contains(qLower)
                orderby nameLower.StartsWith(qLower) ? 0 : 1, c.Name
                select new CompanySuggestDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    LogoUrl = c.LogoUrl,
                    JobsCount = jc == null ? 0 : jc.JobsCount
                };

            return await results.Take(take).ToListAsync(ct);
        }

        // ----------------------------
        // Helpers
        // ----------------------------
        private static string NormalizeLocationForMatch(string? input)
        {
            if (string.IsNullOrWhiteSpace(input)) return "";

            var s = input.Trim();
            var low = s.ToLowerInvariant();

            // slug -> city label (common in DB)
            s = low switch
            {
                "sofia" => "Sofia",
                "plovdiv" => "Plovdiv",
                "varna" => "Varna",
                "burgas" => "Burgas",
                "ruse" => "Ruse",
                "remote" => "Remote",
                _ => s
            };

            return s.Trim();
        }

        // Backward-compatible overload (old signature)
        // Calls the new method with location = null
        public Task<(int TotalCount, IReadOnlyList<CompanyCardDto> Items)> GetCompanyCardsAsync(
            string? search,
            string sort,
            bool onlyActive,
            string? sizeBucket,
            CancellationToken ct = default)
        {
            return GetCompanyCardsAsync(
                search: search,
                sort: sort,
                onlyActive: onlyActive,
                sizeBucket: sizeBucket,
                location: null,
                ct: ct);
        }

    }
}
