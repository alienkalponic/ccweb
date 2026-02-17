using ProjectWeb.Domain.DTO.Banner;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Domain.Model
{
    public class MultipleModel
    {
        public BannerCreateDto? BannerCreateDto { get; set; }
        public List<BannerDto>? BannerDtos { get; set; }
        public BannerDto? BannerDto { get; set; }
        public BannerUpdateDto? BannerUpdateDto { get; set; }
    }
}
