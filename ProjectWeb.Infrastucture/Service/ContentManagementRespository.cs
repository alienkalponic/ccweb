using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ProjectWeb.Application.Common.Repository;
using ProjectWeb.Application.Common.Repository.Master;
using ProjectWeb.Domain.DTO.Banner;
using ProjectWeb.Domain.DTO.ClubDescription;
using ProjectWeb.Domain.DTO.LoginDto;
using ProjectWeb.Domain.Utility;
using System.Net.Http.Headers;

namespace ProjectWeb.Infrastucture.Service
{
    public class ContentManagementRespository : IContentManagement
    {
        private readonly IHttpClientFactory _clientFactory;
        private readonly string projectUrl;
        private readonly IBaseService _baseService;
        private readonly ILogger<ContentManagementRespository> _logger;

        public ContentManagementRespository(
            IHttpClientFactory clientFactory,
            IConfiguration configuration,
            IBaseService baseService,
            IHttpContextAccessor httpContextAccessor,
            ILogger<ContentManagementRespository> logger)
        {
            _baseService = baseService;
            _clientFactory = clientFactory;
            _logger = logger;

            // Read ASPNETCORE_ENVIRONMENT from configuration.
            // Safer than HTTP host-header sniffing which breaks behind reverse proxies.
            var envName = configuration["ASPNETCORE_ENVIRONMENT"] ?? "Production";
            var isProduction = !envName.Equals("Development", StringComparison.OrdinalIgnoreCase);

            projectUrl = isProduction
                        ? configuration.GetValue<string>("LiveServerServiceUrls:ProjectAPI")!
                        : configuration.GetValue<string>("ServiceUrls:ProjectAPI")!;

            _logger.LogInformation("[ContentManagement] Resolved API URL: {Url} (Env: {Env})",
                projectUrl, envName);
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
                Url = projectUrl.TrimEnd('/') + "/api/content/Get-all-banner/" + pageSize + "/" + pageNumber,
            });
        }

        #endregion

        #region:Club Description

        public async Task<T> DescriptionCreate<T>(CreateClubDescriptionDto model)
        {
            // The builder (ApiMessageRequestBuilder) reflects the DTO into MultipartFormDataContent automatically.
            // No manual MultipartFormDataContent construction needed here.
            _logger.LogInformation("[DescriptionCreate] Files={Count}", model?.Files?.Count ?? 0);

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
            _logger.LogInformation("[DescriptionUpdate] Id={Id} NewImages={Imgs} DeletedIds={Ids}",
                model?.ClubDescriptionId, model?.NewImages?.Count ?? 0,
                string.Join(",", model?.DeletedImageIds ?? new List<long>()));

            // ⚠️ DO NOT use 'using var' here — the MultipartFormDataContent must stay alive
            // through the entire async HTTP send (including any 401 token-refresh retry).
            // Bug 2 fix: dispose manually in 'finally' after SendAsync completes.
            var content = new MultipartFormDataContent();

            content.Add(new StringContent(model.ClubDescriptionId.ToString()), "ClubDescriptionId");

            if (model.Title != null)
                content.Add(new StringContent(model.Title), "Title");

            if (model.Description != null)
                content.Add(new StringContent(model.Description), "Description");

            if (model.DisplayOrder.HasValue)
                content.Add(new StringContent(model.DisplayOrder.Value.ToString()), "DisplayOrder");

            if (model.IsActive.HasValue)
                content.Add(new StringContent(model.IsActive.Value.ToString()), "IsActive");

            // Each deleted ID becomes a separate form field with the same name
            foreach (var id in model.DeletedImageIds ?? new List<long>())
                content.Add(new StringContent(id.ToString()), "DeletedImageIds");

            // Each file becomes a separate multipart file part with the correct content-type
            foreach (var file in model.NewImages ?? new List<IFormFile>())
            {
                var streamContent = new StreamContent(file.OpenReadStream());
                streamContent.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType);
                content.Add(streamContent, "NewImages", file.FileName);
            }

            try
            {
                return await _baseService.SendAsync<T>(new APIRequest()
                {
                    ApiType = StaticDetails.ApiType.POST,
                    Data = content,
                    Url = projectUrl.TrimEnd('/') + "/api/content/Update-club-description",
                    ContentType = StaticDetails.ContentType.MultipartFormData
                }, withBearer: true);
            }
            finally
            {
                // Dispose AFTER SendAsync fully completes (including retries)
                content.Dispose();
            }
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
