using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Domain.DTO.Banner
{
    public class BannerDto
    {
        public long BannerId { get; set; }

        public string? Title { get; set; }

        public string? Caption { get; set; }

        public string? ImageUrl { get; set; }

        public string? ImageName { get; set; }

        public string? MobileImageUrl { get; set; }

        public int DisplayOrder { get; set; } = 0;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public bool IsDeleted { get; set; } = false;

        public long? DeletedBy { get; set; }
    }
}
