using System.ComponentModel.DataAnnotations;

namespace DevNest.DTOs
{
    public class NewsletterSubscribeDto
    {
        [Required]
        [EmailAddress]
        [StringLength(254)]
        public string Email { get; set; } = "";
    }
}