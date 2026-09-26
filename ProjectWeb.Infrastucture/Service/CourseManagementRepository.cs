using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ProjectWeb.Application.Common.Repository;
using ProjectWeb.Application.Common.Repository.Master;
using ProjectWeb.Domain.DTO.CourseManagement;
using ProjectWeb.Domain.Utility;
using System;
using System.Net.Http;
using System.Threading.Tasks;

namespace ProjectWeb.Infrastucture.Service
{
    public class CourseManagementRepository : ICourseManagementRepository
    {
        private readonly IHttpClientFactory _clientFactory;
        private readonly string projectUrl;
        private readonly IBaseService _baseService;
        private readonly ILogger<CourseManagementRepository> _logger;

        public CourseManagementRepository(
            IHttpClientFactory clientFactory,
            IConfiguration configuration,
            IBaseService baseService,
            IHttpContextAccessor httpContextAccessor,
            ILogger<CourseManagementRepository> logger)
        {
            _baseService = baseService;
            _clientFactory = clientFactory;
            _logger = logger;

            var envName = configuration["ASPNETCORE_ENVIRONMENT"] ?? "Production";
            var isProduction = !envName.Equals("Development", StringComparison.OrdinalIgnoreCase);

            projectUrl = isProduction
                        ? configuration.GetValue<string>("LiveServerServiceUrls:ProjectAPI")!
                        : configuration.GetValue<string>("ServiceUrls:ProjectAPI")!;

            _logger.LogInformation("[CourseManagementRepository] Resolved API URL: {Url} (Env: {Env})", projectUrl, envName);
        }

        // ==========================================
        // COURSE
        // ==========================================
        public async Task<T> CreateCourse<T>(CreateCourseDto dto)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.POST,
                Data = dto,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/create-course",
                ContentType = StaticDetails.ContentType.Json
            }, withBearer: true);
        }

        public async Task<T> UpdateCourse<T>(UpdateCourseDto dto)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.PUT,
                Data = dto,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/update-course",
                ContentType = StaticDetails.ContentType.Json
            }, withBearer: true);
        }

        public async Task<T> GetAllCourse<T>(int pageNumber = 1, int pageSize = 10, string search = "", bool? isActive = null)
        {
            var query = $"?pageNumber={pageNumber}&pageSize={pageSize}&search={Uri.EscapeDataString(search ?? "")}";
            if (isActive.HasValue) query += $"&isActive={isActive.Value}";

            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.GET,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/get-all-course" + query
            }, withBearer: true);
        }

        public async Task<T> GetCourseById<T>(long id)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.GET,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/get-course/" + id
            }, withBearer: true);
        }

        // ==========================================
        // COURSE BATCH
        // ==========================================
        public async Task<T> CreateCourseBatch<T>(CreateCourseBatchDto dto)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.POST,
                Data = dto,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/create-course-batch",
                ContentType = StaticDetails.ContentType.Json
            }, withBearer: true);
        }

        public async Task<T> UpdateCourseBatch<T>(UpdateCourseBatchDto dto)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.PUT,
                Data = dto,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/update-course-batch",
                ContentType = StaticDetails.ContentType.Json
            }, withBearer: true);
        }

        public async Task<T> GetAllCourseBatch<T>(long? courseId = null, int? year = null, bool? isActive = null, int pageNumber = 1, int pageSize = 10, string search = "")
        {
            var query = $"?pageNumber={pageNumber}&pageSize={pageSize}&search={Uri.EscapeDataString(search ?? "")}";
            if (courseId.HasValue) query += $"&courseId={courseId.Value}";
            if (year.HasValue) query += $"&year={year.Value}";
            if (isActive.HasValue) query += $"&isActive={isActive.Value}";

            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.GET,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/get-all-course-batch" + query
            }, withBearer: true);
        }

        public async Task<T> GetCourseBatchById<T>(long id)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.GET,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/get-course-batch/" + id
            }, withBearer: true);
        }

        // ==========================================
        // ENROLLMENT / PARTICIPANT
        // ==========================================
        public async Task<T> CreateEnrollment<T>(CreateEnrollmentDto dto)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.POST,
                Data = dto,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/create-enrollment",
                ContentType = StaticDetails.ContentType.Json
            }, withBearer: true);
        }

        public async Task<T> UpdateEnrollment<T>(UpdateEnrollmentDto dto)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.PUT,
                Data = dto,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/update-enrollment",
                ContentType = StaticDetails.ContentType.Json
            }, withBearer: true);
        }

        public async Task<T> GetAllEnrollment<T>(long? courseId = null, int? year = null, string? status = null, string? paymentStatus = null, bool? formSubmitted = null, DateTime? dateFrom = null, DateTime? dateTo = null, int pageNumber = 1, int pageSize = 10, string search = "")
        {
            var query = $"?pageNumber={pageNumber}&pageSize={pageSize}&search={Uri.EscapeDataString(search ?? "")}";
            if (courseId.HasValue) query += $"&courseId={courseId.Value}";
            if (year.HasValue) query += $"&year={year.Value}";
            if (!string.IsNullOrEmpty(status)) query += $"&status={Uri.EscapeDataString(status)}";
            if (!string.IsNullOrEmpty(paymentStatus)) query += $"&paymentStatus={Uri.EscapeDataString(paymentStatus)}";
            if (formSubmitted.HasValue) query += $"&formSubmitted={formSubmitted.Value}";
            if (dateFrom.HasValue) query += $"&dateFrom={dateFrom.Value:yyyy-MM-dd}";
            if (dateTo.HasValue) query += $"&dateTo={dateTo.Value:yyyy-MM-dd}";

            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.GET,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/get-all-enrollment" + query
            }, withBearer: true);
        }

        public async Task<T> GetEnrollmentById<T>(long id)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.GET,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/get-enrollment/" + id
            }, withBearer: true);
        }

        public async Task<T> GetEnrollmentDetails<T>(long id)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.GET,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/get-enrollment-details/" + id
            }, withBearer: true);
        }

        // ==========================================
        // PAYMENT
        // ==========================================
        public async Task<T> AddPayment<T>(AddPaymentDto dto)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.POST,
                Data = dto,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/add-payment",
                ContentType = StaticDetails.ContentType.Json
            }, withBearer: true);
        }

        public async Task<T> UpdatePayment<T>(UpdateCoursePaymentRequestDto dto)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.PUT,
                Data = dto,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/update-payment",
                ContentType = StaticDetails.ContentType.Json
            }, withBearer: true);
        }

        public async Task<T> GetEnrollmentPayments<T>(long enrollmentId)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.GET,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/get-enrollment-payments/" + enrollmentId
            }, withBearer: true);
        }

        public async Task<T> GetAllPayment<T>(long? courseId = null, int? year = null, string? paymentMode = null, DateTime? dateFrom = null, DateTime? dateTo = null, int pageNumber = 1, int pageSize = 10, string search = "")
        {
            var query = $"?pageNumber={pageNumber}&pageSize={pageSize}&search={Uri.EscapeDataString(search ?? "")}";
            if (courseId.HasValue) query += $"&courseId={courseId.Value}";
            if (year.HasValue) query += $"&year={year.Value}";
            if (!string.IsNullOrEmpty(paymentMode)) query += $"&paymentMode={Uri.EscapeDataString(paymentMode)}";
            if (dateFrom.HasValue) query += $"&dateFrom={dateFrom.Value:yyyy-MM-dd}";
            if (dateTo.HasValue) query += $"&dateTo={dateTo.Value:yyyy-MM-dd}";

            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.GET,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/get-all-payment" + query
            }, withBearer: true);
        }

        // ==========================================
        // REFUND / CANCELLATION
        // ==========================================
        public async Task<T> CancelEnrollment<T>(CancelEnrollmentDto dto)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.POST,
                Data = dto,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/cancel-enrollment",
                ContentType = StaticDetails.ContentType.Json
            }, withBearer: true);
        }

        public async Task<T> GetEnrollmentRefunds<T>(long enrollmentId)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.GET,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/get-enrollment-refunds/" + enrollmentId
            }, withBearer: true);
        }

        public async Task<T> GetAllRefund<T>(long? courseId = null, int? year = null, string? refundMode = null, DateTime? refundDate = null, int pageNumber = 1, int pageSize = 10, string search = "")
        {
            var query = $"?pageNumber={pageNumber}&pageSize={pageSize}&search={Uri.EscapeDataString(search ?? "")}";
            if (courseId.HasValue) query += $"&courseId={courseId.Value}";
            if (year.HasValue) query += $"&year={year.Value}";
            if (!string.IsNullOrEmpty(refundMode)) query += $"&refundMode={Uri.EscapeDataString(refundMode)}";
            if (refundDate.HasValue) query += $"&refundDate={refundDate.Value:yyyy-MM-dd}";

            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.GET,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/get-all-refund" + query
            }, withBearer: true);
        }

        // ==========================================
        // OFFICIALS
        // ==========================================
        public async Task<T> AddCourseOfficial<T>(AddCourseOfficialDto dto)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.POST,
                Data = dto,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/add-course-official",
                ContentType = StaticDetails.ContentType.Json
            }, withBearer: true);
        }

        public async Task<T> UpdateCourseOfficial<T>(UpdateCourseOfficialDto dto)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.PUT,
                Data = dto,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/update-course-official",
                ContentType = StaticDetails.ContentType.Json
            }, withBearer: true);
        }

        public async Task<T> GetAllCourseOfficial<T>(long? courseId = null, int? year = null, string? role = null, string? paymentStatus = null, int pageNumber = 1, int pageSize = 10, string search = "")
        {
            var query = $"?pageNumber={pageNumber}&pageSize={pageSize}&search={Uri.EscapeDataString(search ?? "")}";
            if (courseId.HasValue) query += $"&courseId={courseId.Value}";
            if (year.HasValue) query += $"&year={year.Value}";
            if (!string.IsNullOrEmpty(role)) query += $"&role={Uri.EscapeDataString(role)}";
            if (!string.IsNullOrEmpty(paymentStatus)) query += $"&paymentStatus={Uri.EscapeDataString(paymentStatus)}";

            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.GET,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/get-all-course-official" + query
            }, withBearer: true);
        }

        public async Task<T> GetCourseOfficialById<T>(long id)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.GET,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/get-course-official/" + id
            }, withBearer: true);
        }

        public async Task<T> UpdateCourseOfficialPaymentStatus<T>(long id, string paymentStatus)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.PUT,
                Data = new UpdateOfficialPaymentStatusDto { CourseOfficialId = id, PaymentStatus = paymentStatus },
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/update-course-official-payment-status",
                ContentType = StaticDetails.ContentType.Json
            }, withBearer: true);
        }

        // ==========================================
        // EXPENSE
        // ==========================================
        public async Task<T> AddCourseExpense<T>(AddCourseExpenseDto dto)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.POST,
                Data = dto,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/add-course-expense",
                ContentType = StaticDetails.ContentType.Json
            }, withBearer: true);
        }

        public async Task<T> UpdateCourseExpense<T>(UpdateCourseExpenseDto dto)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.PUT,
                Data = dto,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/update-course-expense",
                ContentType = StaticDetails.ContentType.Json
            }, withBearer: true);
        }

        public async Task<T> GetAllCourseExpense<T>(long? courseId = null, int? year = null, string? category = null, string? paymentMode = null, DateTime? dateFrom = null, DateTime? dateTo = null, int pageNumber = 1, int pageSize = 10, string search = "")
        {
            var query = $"?pageNumber={pageNumber}&pageSize={pageSize}&search={Uri.EscapeDataString(search ?? "")}";
            if (courseId.HasValue) query += $"&courseId={courseId.Value}";
            if (year.HasValue) query += $"&year={year.Value}";
            if (!string.IsNullOrEmpty(category)) query += $"&category={Uri.EscapeDataString(category)}";
            if (!string.IsNullOrEmpty(paymentMode)) query += $"&paymentMode={Uri.EscapeDataString(paymentMode)}";
            if (dateFrom.HasValue) query += $"&dateFrom={dateFrom.Value:yyyy-MM-dd}";
            if (dateTo.HasValue) query += $"&dateTo={dateTo.Value:yyyy-MM-dd}";

            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.GET,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/get-all-course-expense" + query
            }, withBearer: true);
        }

        public async Task<T> GetCourseExpenseById<T>(long id)
        {
            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.GET,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/get-course-expense/" + id
            }, withBearer: true);
        }

        // ==========================================
        // REPORT / DASHBOARD
        // ==========================================
        public async Task<T> GetCourseDashboard<T>(long? courseId = null, int? year = null, DateTime? dateFrom = null, DateTime? dateTo = null)
        {
            var query = "?";
            if (courseId.HasValue) query += $"courseId={courseId.Value}&";
            if (year.HasValue) query += $"year={year.Value}&";
            if (dateFrom.HasValue) query += $"dateFrom={dateFrom.Value:yyyy-MM-dd}&";
            if (dateTo.HasValue) query += $"dateTo={dateTo.Value:yyyy-MM-dd}&";

            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.GET,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/get-course-dashboard" + query.TrimEnd('&', '?')
            }, withBearer: true);
        }

        public async Task<T> GetCourseSummaryBySegment<T>(int? year = null, DateTime? dateFrom = null, DateTime? dateTo = null)
        {
            var query = "?";
            if (year.HasValue) query += $"year={year.Value}&";
            if (dateFrom.HasValue) query += $"dateFrom={dateFrom.Value:yyyy-MM-dd}&";
            if (dateTo.HasValue) query += $"dateTo={dateTo.Value:yyyy-MM-dd}&";

            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.GET,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/get-course-summary-by-segment" + query.TrimEnd('&', '?')
            }, withBearer: true);
        }

        public async Task<T> GetYearWiseCourseSummary<T>(int? fromYear = null, int? toYear = null)
        {
            var query = "?";
            if (fromYear.HasValue) query += $"fromYear={fromYear.Value}&";
            if (toYear.HasValue) query += $"toYear={toYear.Value}&";

            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.GET,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/get-year-wise-course-summary" + query.TrimEnd('&', '?')
            }, withBearer: true);
        }

        public async Task<T> GetCourseFinancialReport<T>(long? courseId = null, int? year = null, DateTime? dateFrom = null, DateTime? dateTo = null)
        {
            var query = "?";
            if (courseId.HasValue) query += $"courseId={courseId.Value}&";
            if (year.HasValue) query += $"year={year.Value}&";
            if (dateFrom.HasValue) query += $"dateFrom={dateFrom.Value:yyyy-MM-dd}&";
            if (dateTo.HasValue) query += $"dateTo={dateTo.Value:yyyy-MM-dd}&";

            return await _baseService.SendAsync<T>(new APIRequest
            {
                ApiType = StaticDetails.ApiType.GET,
                Url = projectUrl.TrimEnd('/') + "/api/CourseManagement/get-course-financial-report" + query.TrimEnd('&', '?')
            }, withBearer: true);
        }
    }
}
