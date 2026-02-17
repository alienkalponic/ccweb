using ProjectWeb.Domain.DTO.Banner;
using ProjectWeb.Domain.DTO.LoginDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Application.Common.Repository
{
    public interface IContentManagement
    {
        Task<T> BannerCreate<T>(BannerCreateDto model);
    }
}
