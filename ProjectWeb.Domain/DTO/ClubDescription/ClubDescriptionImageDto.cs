using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Domain.DTO.ClubDescription
{
    public class ClubDescriptionImageDto
    {
        public long ClubDescriptionImageId { get; set; }

        public long ClubDescriptionId { get; set; }

        public string? Title { get; set; }

        public string? ImageName { get; set; }
        public string? ImageUrl { get; set; }

        public int DisplayOrder { get; set; }

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public bool IsDeleted { get; set; }

        public long? DeletedBy { get; set; }
    }
}
