using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Domain.DTO.Category
{
    public class CategoryDto
    {
        public long CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public short? DisplayPriority { get; set; }
        public bool? IsDeleted { get; set; }
        public DateTime? DeletedDate { get; set; }
        public long? DeletedBy { get; set; }
    }
}
