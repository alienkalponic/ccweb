using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using ProjectWeb.Application.Common.Repository.Master;
using ProjectWeb.Application.Common.Repository.SystemLogin;
using ProjectWeb.Domain.DTO.LoginDto;
using ProjectWeb.Domain.Utility;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Infrastucture.Service.SystemLogin
{
    public class UserRepository : IUserRepository
    {
        private readonly IHttpClientFactory _clientFactory;
        private string projectUrl;
        private readonly IBaseService _baseService;
        private IHttpContextAccessor _httpContextAccessor;

        public UserRepository(IHttpClientFactory clientFactory, IConfiguration configuration, IBaseService baseService, IHttpContextAccessor httpContextAccessor)
        {
            _baseService = baseService;
            _clientFactory = clientFactory;
            _httpContextAccessor = httpContextAccessor;
            var hostName = _httpContextAccessor.HttpContext?.Request.Host.Host!;
            projectUrl = hostName.Contains("localhost")
                        ? configuration.GetValue<string>("ServiceUrls:ProjectAPI")
                        : configuration.GetValue<string>("LiveServerServiceUrls:ProjectAPI");
        }
        public async Task<T> GenerateNewTokenAsync<T>(long userId)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.GET,
                Url = projectUrl + "/api/auth/generate-new-token/" + userId,
            }, withBearer: false);
        }

        public async Task<T> LoginAsync<T>(LoginRequestDTO obj)
        {
            return await _baseService.SendAsync<T>(new APIRequest()
            {
                ApiType = StaticDetails.ApiType.POST,
                Data = obj,
                Url = projectUrl + "/api/auth/login"
            }, withBearer: false);
        }
    }
}
