using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Domain.DTO.ActivityDetails
{
    public class ActivityDetailsImageDto
    {
        public long ActivitieDetailsImageId { get; set; }

        public string? ActivitieDetailsImageName { get; set; }

        public string? ImagePath1 { get; set; }

        public short? DisplayPriority { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
