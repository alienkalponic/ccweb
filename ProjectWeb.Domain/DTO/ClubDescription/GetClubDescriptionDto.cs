using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Domain.DTO.ClubDescription
{
    public class GetClubDescriptionDto
    {
        public long ClubDescriptionId { get; set; }

        public string? Title { get; set; }

        public string? Description { get; set; }

        public int DisplayOrder { get; set; }

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public bool IsDeleted { get; set; }

        public long? DeletedBy { get; set; }
        public List<ClubDescriptionImageDto>? Images { get; set; }
    }
}
