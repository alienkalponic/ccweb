using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Domain.DTO.ClubDescription
{
    public class CreateClubDescriptionDto
    {
        public string Title { get; set; } = default!;
        public string? Description { get; set; }
        public int DisplayOrder { get; set; } = 0;
        public bool IsActive { get; set; } = true;

        // 🔥 JSON STRING (very important)
        public string? ImagesJson { get; set; }

        // 🔥 MULTIPLE FILES
        public List<IFormFile>? Files { get; set; }
    }
}
