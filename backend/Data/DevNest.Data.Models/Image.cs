namespace DevNest.Data.Models
{
    using DevNest.Data.Common.Models;

    public class Image : BaseDeletableModel<int>
    {
        public string Url { get; set; }

        public string AltText { get; set; }
    }
}
