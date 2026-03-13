using ProjectWeb.Domain.DTO.Banner;
using ProjectWeb.Domain.DTO.ClubDescription;
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
        #region::Banner
        Task<T> BannerCreate<T>(BannerCreateDto model);
        Task<T> BannerUpdate<T>(BannerUpdateDto model);
        Task<T> BannerDelete<T>(int id);
        Task<T> BannerGet<T>(int id);
        Task<T> BannerGetAll<T>(string pageSize,string pageNumber,string Search);
        #endregion

        #region:Club Description
        Task<T> DescriptionCreate<T>(CreateClubDescriptionDto model);
        Task<T> DescriptionUpdate<T>(UpdateClubDescriptionRequestDto model);
        Task<T> DescriptionDelete<T>(int id);
        Task<T> DescriptionGet<T>(int id);
        Task<T> DescriptionGetAll<T>(string pageSize, string pageNumber, string Search);
        #endregion
    }
}
