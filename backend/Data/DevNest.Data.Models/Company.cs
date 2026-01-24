namespace DevNest.Data.Models
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;

    using DevNest.Data.Common.Models;

    public class Company : BaseDeletableModel<int>
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        public string Description { get; set; }

        [Url]
        [StringLength(500)]
        public string Website { get; set; }

        public int LogoImageId { get; set; }

        [StringLength(100)]
        public string Slug { get; set; }

        public Image Logo { get; set; }

        public int TrophyCount { get; set; }

        public string TrophyName { get; set; }

        public ICollection<CompanyTechnology> CompanyTechnologies { get; set; }

        public ICollection<Jobs> Jobs { get; set; }
    }
}
