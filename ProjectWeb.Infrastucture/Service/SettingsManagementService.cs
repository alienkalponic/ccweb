using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ProjectWeb.Application.Common.Repository;
using ProjectWeb.Application.Common.Repository.Master;
using ProjectWeb.Domain.DTO.SettingsManagement;
using ProjectWeb.Domain.Utility;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Infrastucture.Service
{
    public class SettingsManagementService : ISettingsManagementRepository
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

        // ==========================================
        // COURSE ACCOUNTANT / PAYMENT RECEIVER SETTINGS
        // ==========================================

        public async Task<T> GetAllCourseAccountant<T>()
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.GET,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/get-all-course-accountant-wise",
                ContentType = StaticDetails.ContentType.Json
            }, withBearer: false);
        }

        public async Task<T> GetCourseAccountantById<T>(long id)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.GET,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/get-course-accountant/" + id,
                ContentType = StaticDetails.ContentType.Json
            }, withBearer: true);
        }

        public async Task<T> CreateCourseAccountant<T>(CreateCourseAccountantDto dto)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.POST,
                Data = dto,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/create-course-accountant",
                ContentType = StaticDetails.ContentType.Json
            }, withBearer: true);
        }

        public async Task<T> UpdateCourseAccountant<T>(UpdateCourseAccountantDto dto)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.PUT,
                Data = dto,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/update-course-accountant",
                ContentType = StaticDetails.ContentType.Json
            }, withBearer: true);
        }

        public async Task<T> InactiveCourseAccountant<T>(long id)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.PUT,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/inactive-course-accountant/" + id,
                ContentType = StaticDetails.ContentType.Json
            }, withBearer: true);
        }

        public async Task<T> DeleteCourseAccountant<T>(long id)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.DELETE,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/delete-course-accountant/" + id,
                ContentType = StaticDetails.ContentType.Json
            }, withBearer: true);
        }

        public async Task<T> UpdateCourseAccountantStatus<T>(long id, bool isActive)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.PUT,
                Url = projectUrl.TrimEnd('/') + $"/api/CourseManagement/update-course-accountant-status/{id}/{isActive}",
                ContentType = StaticDetails.ContentType.Json
            }, withBearer: true);
        }

        // ==========================================
        // COURSE EXPENSE CATEGORY SETTINGS
        // ==========================================

        public async Task<T> GetAllCourseExpenseCategory<T>(bool? isActive = null)
        {
            var query = isActive.HasValue ? $"?isActive={isActive.Value}" : "";
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.GET,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/get-all-course-expense-category" + query,
                ContentType = StaticDetails.ContentType.Json
            }, withBearer: false);
        }

        public async Task<T> GetCourseExpenseCategoryById<T>(long id)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.GET,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/get-course-expense-category/" + id,
                ContentType = StaticDetails.ContentType.Json
            }, withBearer: true);
        }

        public async Task<T> CreateCourseExpenseCategory<T>(CreateCourseExpenseCategoryDto dto)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.POST,
                Data = dto,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/create-course-expense-category",
                ContentType = StaticDetails.ContentType.Json
            }, withBearer: true);
        }

        public async Task<T> UpdateCourseExpenseCategory<T>(UpdateCourseExpenseCategoryDto dto)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.PUT,
                Data = dto,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/update-course-expense-category",
                ContentType = StaticDetails.ContentType.Json
            }, withBearer: true);
        }

        public async Task<T> InactiveCourseExpenseCategory<T>(long id)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.PUT,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/inactive-course-expense-category/" + id,
                ContentType = StaticDetails.ContentType.Json
            }, withBearer: true);
        }

        public async Task<T> DeleteCourseExpenseCategory<T>(long id)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.DELETE,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/delete-course-expense-category/" + id,
                ContentType = StaticDetails.ContentType.Json
            }, withBearer: true);
        }

        public async Task<T> UpdateCourseExpenseCategoryStatus<T>(long id, bool isActive)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.PUT,
                Url = projectUrl.TrimEnd('/') + $"/api/CourseManagement/update-course-expense-category-status/{id}/{isActive}",
                ContentType = StaticDetails.ContentType.Json
            }, withBearer: true);
        }
    }
}
