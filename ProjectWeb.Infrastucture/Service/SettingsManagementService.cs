using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ProjectWeb.Application.Common.Repository;
using ProjectWeb.Application.Common.Repository.Master;
using ProjectWeb.Domain.Utility;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Infrastucture.Service
{
    public class SettingsManagementService:ISettingsManagementRepository
    {
        private readonly IHttpClientFactory _clientFactory;
        private readonly string projectUrl;
        private readonly IBaseService _baseService;
        private readonly ILogger<SettingsManagementService> _logger;

        public SettingsManagementService(
            IHttpClientFactory clientFactory,
            IConfiguration configuration,
            IBaseService baseService,
            IHttpContextAccessor httpContextAccessor,
            ILogger<SettingsManagementService> logger
            )
        {
            _baseService = baseService;
            _clientFactory = clientFactory;
            _logger = logger;
            var envName = configuration["ASPNETCORE_ENVIRONMENT"] ?? "Production";
            var isProduction = !envName.Equals("Development", StringComparison.OrdinalIgnoreCase);

            projectUrl = isProduction
                        ? configuration.GetValue<string>("LiveServerServiceUrls:ProjectAPI")!
                        : configuration.GetValue<string>("ServiceUrls:ProjectAPI")!;

            _logger.LogInformation("[SettingsManagement] Resolved API URL: {Url} (Env: {Env})",
                projectUrl, envName);
        }

        public async Task<T> GetAllCategory<T>()
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.GET,
                Url = projectUrl.TrimEnd('/') + "/api/settings/Get-all-category-details",
            }, withBearer: false);
        }
    }
}
