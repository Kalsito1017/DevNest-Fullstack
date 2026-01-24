namespace DevNest.Data.Models
{
    using DevNest.Data.Common.Models;

    public class Technology : BaseDeletableModel<int>
    {
        public string Name { get; set; }

        public int IconImageId { get; set; }

        public Image Icon { get; set; }
    }
}
