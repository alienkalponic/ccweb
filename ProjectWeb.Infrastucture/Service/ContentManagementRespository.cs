using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using ProjectWeb.Application.Common.Repository;
using ProjectWeb.Application.Common.Repository.Master;
using ProjectWeb.Domain.DTO.Banner;
using ProjectWeb.Domain.DTO.ClubDescription;
using ProjectWeb.Domain.DTO.LoginDto;
using ProjectWeb.Domain.Utility;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Infrastucture.Service
{
    public class ContentManagementRespository : IContentManagement
    {
        private readonly IHttpClientFactory _clientFactory;
        private string projectUrl;
        private readonly IBaseService _baseService;
        private IHttpContextAccessor _httpContextAccessor;

        public ContentManagementRespository(IHttpClientFactory clientFactory, IConfiguration configuration, IBaseService baseService, IHttpContextAccessor httpContextAccessor)
        {
            _baseService = baseService;
            _clientFactory = clientFactory;
            _httpContextAccessor = httpContextAccessor;
            var hostName = _httpContextAccessor.HttpContext?.Request.Host.Host!;
            projectUrl = hostName.Contains("localhost")
                        ? configuration.GetValue<string>("ServiceUrls:ProjectAPI")!
                        : configuration.GetValue<string>("LiveServerServiceUrls:ProjectAPI")!;
        }

        #region::Banner
        public async Task<T> BannerCreate<T>(BannerCreateDto obj)
        {
            return await _baseService.SendAsync<T>(new APIRequest()
            {
                ApiType = StaticDetails.ApiType.POST,
                Data = obj,
                Url = projectUrl.TrimEnd('/') + "/api/content/Create-banner",
                ContentType = StaticDetails.ContentType.MultipartFormData
            }, withBearer: true);
        }

        public async Task<T> BannerUpdate<T>(BannerUpdateDto model)
        {
            return await _baseService.SendAsync<T>(new APIRequest()
            {
                ApiType = StaticDetails.ApiType.PUT,
                Data = model,
                Url = projectUrl.TrimEnd('/') + "/api/content/Update-banner",
                ContentType = StaticDetails.ContentType.MultipartFormData
            }, withBearer: true);
        }

        public async Task<T> BannerDelete<T>(int id)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.DELETE,
                Url = projectUrl.TrimEnd('/') + "/api/content/delete-banner-by-id/" + id,
            }, withBearer: true);
        }

        public async Task<T> BannerGet<T>(int id)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.GET,
                Url = projectUrl.TrimEnd('/') + "/api/content/Get-banner-by-id/" + id,
            });
        }

        public async Task<T> BannerGetAll<T>(string pageSize, string pageNumber, string Search)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.GET,
                Url = projectUrl.TrimEnd('/') + "/api/content/Get-all-banner/" + pageSize+"/"+pageNumber,
            });
        }

        #endregion

        #region:Club Description
        public async Task<T> DescriptionCreate<T>(CreateClubDescriptionDto model)
        {
            return await _baseService.SendAsync<T>(new APIRequest()
            {
                ApiType = StaticDetails.ApiType.POST,
                Data = model,
                Url = projectUrl.TrimEnd('/') + "/api/content/Create-club-description",
                ContentType = StaticDetails.ContentType.MultipartFormData
            }, withBearer: true);
        }

        public async Task<T> DescriptionUpdate<T>(UpdateClubDescriptionRequestDto model)
        {
            using var content = new MultipartFormDataContent();
            content.Add(new StringContent(model.ClubDescriptionId.ToString()), "ClubDescriptionId");

            if (model.Title != null)
                content.Add(new StringContent(model.Title), "Title");

            if (model.Description != null)
                content.Add(new StringContent(model.Description), "Description");

            if (model.DisplayOrder.HasValue)
                content.Add(new StringContent(model.DisplayOrder.Value.ToString()), "DisplayOrder");

            if (model.IsActive.HasValue)
                content.Add(new StringContent(model.IsActive.Value.ToString()), "IsActive");

            // 🔥🔥🔥 THIS IS THE FIX
            foreach (var id in model.DeletedImageIds)
            {
                content.Add(new StringContent(id.ToString()), "DeletedImageIds");
            }

            foreach (var file in model.NewImages)
            {
                var stream = file.OpenReadStream();
                content.Add(new StreamContent(stream), "NewImages", file.FileName);
            }
            return await _baseService.SendAsync<T>(new APIRequest()
            {
                ApiType = StaticDetails.ApiType.POST,
                Data = content,
                Url = projectUrl.TrimEnd('/') + "/api/content/Update-club-description",
                ContentType = StaticDetails.ContentType.MultipartFormData

            }, withBearer: true);
        }

        public async Task<T> DescriptionDelete<T>(int id)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.DELETE,
                Url = projectUrl.TrimEnd('/') + "/api/content/delete-club-description-by-id/" + id,
            }, withBearer: true);
        }

        public async Task<T> DescriptionGet<T>(int id)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.GET,
                Url = projectUrl.TrimEnd('/') + "/api/content/Get-club-description-by-id/" + id,
            });
        }

        public async Task<T> DescriptionGetAll<T>(string pageSize, string pageNumber, string Search)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.GET,
                Url = projectUrl.TrimEnd('/') + "/api/content/Get-all-club-description/" + pageSize + "/" + pageNumber,
            });
        }
        #endregion
    }
}
