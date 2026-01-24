namespace DevNest.Data.Models
{
    using System;
    using System.ComponentModel.DataAnnotations;

    using DevNest.Data.Common.Models;

    public class Jobs : BaseDeletableModel<int>
    {
        public string Title { get; set; }

        public string Description { get; set; }

        public DateTime PostedDate { get; set; }

        public string Location { get; set; }

        [StringLength(50)]
        public string EmploymentType { get; set; }

        [StringLength(100)]
        public string ExperienceLevel { get; set; }

        public decimal Salary { get; set; }

        public string TechStack { get; set; }

        public string EssentialRoleDescription { get; set; }

        public string RequirementsDescription { get; set; }

        public string BenefitsDescription { get; set; }

        public int CompanyId { get; set; }

        public Company Company { get; set; }
    }
}
