using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Domain.DTO.ClubActivity
{
    public class CreateClubActivityDto
    {
        public string Title { get; set; } = string.Empty;
        public string? SubTitle { get; set; }
        public string? Description { get; set; }
        public string? RedirectUrl { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public IFormFile? Image { get; set; }
    }

    public class UpdateClubActivityDto : CreateClubActivityDto
    {
        public int ActivityId { get; set; }
    }

    public class GetClubActivityDto
    {
        public int ActivityId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? SubTitle { get; set; }
        public string? Description { get; set; }
        public string? RedirectUrl { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public string? ImageUrl { get; set; }
    }
}
