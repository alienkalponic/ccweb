using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
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
        private readonly string projectUrl;
        private readonly IBaseService _baseService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<UserRepository> _logger;

        public UserRepository(
            IHttpClientFactory clientFactory, 
            IConfiguration configuration, 
            IBaseService baseService, 
            IHttpContextAccessor httpContextAccessor,
            ILogger<UserRepository> logger)
        {
            _baseService = baseService;
            _clientFactory = clientFactory;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;

            // Read ASPNETCORE_ENVIRONMENT from configuration.
            // Avoids hostname sniffing which breaks behind reverse proxies.
            var envName = configuration["ASPNETCORE_ENVIRONMENT"] ?? "Production";
            var isProduction = !envName.Equals("Development", StringComparison.OrdinalIgnoreCase);

            projectUrl = (isProduction
                        ? configuration.GetValue<string>("LiveServerServiceUrls:ProjectAPI")
                        : configuration.GetValue<string>("ServiceUrls:ProjectAPI")) ?? "";

            _logger.LogInformation("[UserRepository] Resolved API URL: {Url} (Env: {Env})",
                projectUrl, envName);
        }

        public async Task<T> GenerateNewTokenAsync<T>(long userId)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.GET,
                Url = projectUrl.TrimEnd('/') + "/api/auth/generate-new-token/" + userId,
            }, withBearer: false);
        }

        public async Task<T> LoginAsync<T>(LoginRequestDTO obj)
        {
            return await _baseService.SendAsync<T>(new APIRequest()
            {
                ApiType = StaticDetails.ApiType.POST,
                Data = obj,
                Url = projectUrl.TrimEnd('/') + "/api/auth/login"
            }, withBearer: false);
        }
    }
}
