using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Domain.DTO.ActivityDetails
{
    public class UpdateActivityDetailsDto
    {
        public long ActivitieDetailsId { get; set; }

        public long ActivityId { get; set; }

        public string? Title { get; set; }

        public string? SubTitle { get; set; }

        public string? Description { get; set; }

        public string? StartDate { get; set; }

        public string? EndDate { get; set; }

        public string? Location { get; set; }

        public string? Duration { get; set; }

        public string? Fee { get; set; }

        public int DisplayOrder { get; set; }

        public bool IsActive { get; set; }

        public List<long> DeletedImageIds { get; set; } = new();

        public List<IFormFile>? NewImages { get; set; }


        public List<short>? DisplayPriorities { get; set; }
    }
}
