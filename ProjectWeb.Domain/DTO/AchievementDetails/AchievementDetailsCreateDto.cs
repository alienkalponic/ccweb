using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Domain.DTO.AchievementDetails
{
    public class AchievementDetailsCreateDto
    {
        public long? GalleryItemsId { get; set; }
        public string? Title { get; set; }
        public string? SubTitle { get; set; }
        //public bool? IsActive { get; set; }
    }
}
