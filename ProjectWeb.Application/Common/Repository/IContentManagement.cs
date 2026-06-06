using ProjectWeb.Domain.DTO.ActivityDetails;
using ProjectWeb.Domain.DTO.Banner;
using ProjectWeb.Domain.DTO.ClubDescription;
using ProjectWeb.Domain.DTO.Gallery;
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

        #region:Club Activity
        Task<T> ActivityCreate<T>(ProjectWeb.Domain.DTO.ClubActivity.CreateClubActivityDto model);
        Task<T> ActivityUpdate<T>(ProjectWeb.Domain.DTO.ClubActivity.UpdateClubActivityDto model);
        Task<T> ActivityDelete<T>(int id);
        Task<T> ActivityGet<T>(int id);
        Task<T> ActivityGetAll<T>(string pageSize, string pageNumber, string Search);
        #endregion

        #region:Gallery
        Task<T> GalleryCreate<T>(CreateGalleryDto model);
        Task<T> GalleryUpdate<T>(UpdateGalleryDto model);
        Task<T> GalleryDelete<T>(int id);
        Task<T> GalleryGet<T>(int id);
        Task<T> GalleryGetAll<T>(string pageSize, string pageNumber, string Search);
        #endregion

        #region::ActivityDetails
        Task<T> ActivityDetailsCreate<T>(CreateActivityDetailsDto model);
        Task<T> ActivityDetailsUpdate<T>(UpdateActivityDetailsDto model);
        Task<T> ActivityDetailsDelete<T>(int id);
        Task<T> ActivityDetailsGet<T>(int id);
        Task<T> ActivityDetailsGetAll<T>(string pageSize, string pageNumber, string Search);
        #endregion
    }
}
