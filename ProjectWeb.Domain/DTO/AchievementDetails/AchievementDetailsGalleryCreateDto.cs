using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Domain.DTO.AchievementDetails
{
    public class AchievementDetailsGalleryCreateDto
    {
        public long? AchievementDetailsId { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? ImagePath1 { get; set; }
        public int? DisplayOrder { get; set; }
        public bool? IsActive { get; set; }
        public IFormFile? Image { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
