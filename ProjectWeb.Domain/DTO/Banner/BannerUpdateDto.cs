using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Domain.DTO.Banner
{
    public class BannerUpdateDto
    {
        [Required]

        public int BannerId { get; set; }
        public IFormFile File { get; set; } = default!;

        public IFormFile? MobileFile { get; set; }

        [Required]
        [MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Caption { get; set; }

        public bool IsActive { get; set; }

        [Required]
        public int DisplayOrder { get; set; }
    }
}
