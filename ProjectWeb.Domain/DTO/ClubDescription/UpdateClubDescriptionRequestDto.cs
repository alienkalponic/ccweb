using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Domain.DTO.ClubDescription
{
    public class UpdateClubDescriptionRequestDto
    {
        public long ClubDescriptionId { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public int? DisplayOrder { get; set; }
        public bool? IsActive { get; set; }

        // IDs of existing images to delete
        public List<long> DeletedImageIds { get; set; } = new();

        // New images to add
        public List<IFormFile> NewImages { get; set; } = new();
    }
}
