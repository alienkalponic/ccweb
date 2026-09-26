using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using ProjectWeb.Application.Common.Repository.Master;
using ProjectWeb.Domain.DTO.CourseManagement;
using ProjectWeb.Domain.Utility;
using System;
using System.Threading.Tasks;

namespace ProjectWeb.WEB.Controllers
{
    public class CourseManagementController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<CourseManagementController> _logger;

        public CourseManagementController(IUnitOfWork unitOfWork, ILogger<CourseManagementController> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        // ==========================================
        // RAZOR VIEW ACTIONS
        // ==========================================

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Courses()
        {
            return View();
        }

        public IActionResult CourseBatches()
        {
            return View();
        }

        public IActionResult Participants()
        {
            return View();
        }

        public IActionResult Payments()
        {
            return View();
        }

        public IActionResult Refunds()
        {
            return View();
        }

        public IActionResult Officials()
        {
            return View();
        }

        public IActionResult Expenses()
        {
            return View();
        }

        public IActionResult Reports()
        {
            return View();
        }

        // ==========================================
        // COURSE AJAX API PROXIES
        // ==========================================

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpPost]
        public async Task<IActionResult> CreateCourse([FromBody] CreateCourseDto dto)
        {
            APIResponse response = await _unitOfWork.CourseManagement.CreateCourse<APIResponse>(dto);
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpPost]
        public async Task<IActionResult> UpdateCourse([FromBody] UpdateCourseDto dto)
        {
            APIResponse response = await _unitOfWork.CourseManagement.UpdateCourse<APIResponse>(dto);
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpGet]
        public async Task<IActionResult> GetAllCourse(int pageNumber = 1, int pageSize = 10, string search = "", bool? isActive = null)
        {
            APIResponse response = await _unitOfWork.CourseManagement.GetAllCourse<APIResponse>(pageNumber, pageSize, search, isActive);
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpGet]
        public async Task<IActionResult> GetCourseById(long id)
        {
            APIResponse response = await _unitOfWork.CourseManagement.GetCourseById<APIResponse>(id);
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        // ==========================================
        // COURSE BATCH AJAX API PROXIES
        // ==========================================

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpPost]
        public async Task<IActionResult> CreateCourseBatch([FromBody] CreateCourseBatchDto dto)
        {
            APIResponse response = await _unitOfWork.CourseManagement.CreateCourseBatch<APIResponse>(dto);
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpPost]
        public async Task<IActionResult> UpdateCourseBatch([FromBody] UpdateCourseBatchDto dto)
        {
            APIResponse response = await _unitOfWork.CourseManagement.UpdateCourseBatch<APIResponse>(dto);
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpGet]
        public async Task<IActionResult> GetAllCourseBatch(long? courseId = null, int? year = null, bool? isActive = null, int pageNumber = 1, int pageSize = 10, string search = "")
        {
            APIResponse response = await _unitOfWork.CourseManagement.GetAllCourseBatch<APIResponse>(courseId, year, isActive, pageNumber, pageSize, search);
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpGet]
        public async Task<IActionResult> GetCourseBatchById(long id)
        {
            APIResponse response = await _unitOfWork.CourseManagement.GetCourseBatchById<APIResponse>(id);
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        // ==========================================
        // ENROLLMENT AJAX API PROXIES
        // ==========================================

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpPost]
        public async Task<IActionResult> CreateEnrollment([FromBody] CreateEnrollmentDto dto)
        {
            APIResponse response = await _unitOfWork.CourseManagement.CreateEnrollment<APIResponse>(dto);
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpPost]
        public async Task<IActionResult> UpdateEnrollment([FromBody] UpdateEnrollmentDto dto)
        {
            APIResponse response = await _unitOfWork.CourseManagement.UpdateEnrollment<APIResponse>(dto);
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpGet]
        public async Task<IActionResult> GetAllEnrollment(long? courseId = null, int? year = null, string? status = null, string? paymentStatus = null, bool? formSubmitted = null, DateTime? dateFrom = null, DateTime? dateTo = null, int pageNumber = 1, int pageSize = 10, string search = "")
        {
            APIResponse response = await _unitOfWork.CourseManagement.GetAllEnrollment<APIResponse>(courseId, year, status, paymentStatus, formSubmitted, dateFrom, dateTo, pageNumber, pageSize, search);
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpGet]
        public async Task<IActionResult> GetEnrollmentById(long id)
        {
            APIResponse response = await _unitOfWork.CourseManagement.GetEnrollmentById<APIResponse>(id);
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpGet]
        public async Task<IActionResult> GetEnrollmentDetails(long id)
        {
            APIResponse response = await _unitOfWork.CourseManagement.GetEnrollmentDetails<APIResponse>(id);
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        // ==========================================
        // PAYMENT AJAX API PROXIES
        // ==========================================

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpPost]
        public async Task<IActionResult> AddPayment([FromBody] AddPaymentDto dto)
        {
            APIResponse response = await _unitOfWork.CourseManagement.AddPayment<APIResponse>(dto);
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpPost]
        [HttpPut]
        public async Task<IActionResult> UpdatePayment([FromBody] UpdateCoursePaymentRequestDto dto)
        {
            APIResponse response = await _unitOfWork.CourseManagement.UpdatePayment<APIResponse>(dto);
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpGet]
        public async Task<IActionResult> GetEnrollmentPayments(long enrollmentId)
        {
            APIResponse response = await _unitOfWork.CourseManagement.GetEnrollmentPayments<APIResponse>(enrollmentId);
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpGet]
        public async Task<IActionResult> GetAllPayment(long? courseId = null, int? year = null, string? paymentMode = null, DateTime? dateFrom = null, DateTime? dateTo = null, int pageNumber = 1, int pageSize = 10, string search = "")
        {
            APIResponse response = await _unitOfWork.CourseManagement.GetAllPayment<APIResponse>(courseId, year, paymentMode, dateFrom, dateTo, pageNumber, pageSize, search);
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        // ==========================================
        // REFUND / CANCELLATION AJAX API PROXIES
        // ==========================================

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpPost]
        public async Task<IActionResult> CancelEnrollment([FromBody] CancelEnrollmentDto dto)
        {
            APIResponse response = await _unitOfWork.CourseManagement.CancelEnrollment<APIResponse>(dto);
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpGet]
        public async Task<IActionResult> GetEnrollmentRefunds(long enrollmentId)
        {
            APIResponse response = await _unitOfWork.CourseManagement.GetEnrollmentRefunds<APIResponse>(enrollmentId);
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpGet]
        public async Task<IActionResult> GetAllRefund(long? courseId = null, int? year = null, string? refundMode = null, DateTime? refundDate = null, int pageNumber = 1, int pageSize = 10, string search = "")
        {
            APIResponse response = await _unitOfWork.CourseManagement.GetAllRefund<APIResponse>(courseId, year, refundMode, refundDate, pageNumber, pageSize, search);
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        // ==========================================
        // OFFICIALS AJAX API PROXIES
        // ==========================================

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpPost]
        public async Task<IActionResult> AddCourseOfficial([FromBody] AddCourseOfficialDto dto)
        {
            APIResponse response = await _unitOfWork.CourseManagement.AddCourseOfficial<APIResponse>(dto);
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpPost]
        public async Task<IActionResult> UpdateCourseOfficial([FromBody] UpdateCourseOfficialDto dto)
        {
            APIResponse response = await _unitOfWork.CourseManagement.UpdateCourseOfficial<APIResponse>(dto);
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpGet]
        public async Task<IActionResult> GetAllCourseOfficial(long? courseId = null, int? year = null, string? role = null, string? paymentStatus = null, int pageNumber = 1, int pageSize = 10, string search = "")
        {
            APIResponse response = await _unitOfWork.CourseManagement.GetAllCourseOfficial<APIResponse>(courseId, year, role, paymentStatus, pageNumber, pageSize, search);
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpGet]
        public async Task<IActionResult> GetCourseOfficialById(long id)
        {
            APIResponse response = await _unitOfWork.CourseManagement.GetCourseOfficialById<APIResponse>(id);
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpPost]
        public async Task<IActionResult> UpdateCourseOfficialPaymentStatus(long id, string paymentStatus)
        {
            APIResponse response = await _unitOfWork.CourseManagement.UpdateCourseOfficialPaymentStatus<APIResponse>(id, paymentStatus);
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        // ==========================================
        // EXPENSE AJAX API PROXIES
        // ==========================================

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpPost]
        public async Task<IActionResult> AddCourseExpense([FromBody] AddCourseExpenseDto dto)
        {
            APIResponse response = await _unitOfWork.CourseManagement.AddCourseExpense<APIResponse>(dto);
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpPost]
        public async Task<IActionResult> UpdateCourseExpense([FromBody] UpdateCourseExpenseDto dto)
        {
            APIResponse response = await _unitOfWork.CourseManagement.UpdateCourseExpense<APIResponse>(dto);
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpGet]
        public async Task<IActionResult> GetAllCourseExpense(long? courseId = null, int? year = null, string? category = null, string? paymentMode = null, DateTime? dateFrom = null, DateTime? dateTo = null, int pageNumber = 1, int pageSize = 10, string search = "")
        {
            APIResponse response = await _unitOfWork.CourseManagement.GetAllCourseExpense<APIResponse>(courseId, year, category, paymentMode, dateFrom, dateTo, pageNumber, pageSize, search);
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpGet]
        public async Task<IActionResult> GetCourseExpenseById(long id)
        {
            APIResponse response = await _unitOfWork.CourseManagement.GetCourseExpenseById<APIResponse>(id);
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        // ==========================================
        // REPORT / DASHBOARD AJAX API PROXIES
        // ==========================================

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpGet]
        public async Task<IActionResult> GetCourseDashboard(long? courseId = null, int? year = null, DateTime? dateFrom = null, DateTime? dateTo = null)
        {
            APIResponse response = await _unitOfWork.CourseManagement.GetCourseDashboard<APIResponse>(courseId, year, dateFrom, dateTo);
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpGet]
        public async Task<IActionResult> GetCourseSummaryBySegment(int? year = null, DateTime? dateFrom = null, DateTime? dateTo = null)
        {
            APIResponse response = await _unitOfWork.CourseManagement.GetCourseSummaryBySegment<APIResponse>(year, dateFrom, dateTo);
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpGet]
        public async Task<IActionResult> GetYearWiseCourseSummary(int? year = null, int? fromYear = null, int? toYear = null)
        {
            int? fYr = fromYear ?? year;
            int? tYr = toYear ?? year;
            APIResponse response = await _unitOfWork.CourseManagement.GetYearWiseCourseSummary<APIResponse>(fYr, tYr);
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpGet]
        public async Task<IActionResult> GetCourseFinancialReport(long? courseId = null, int? year = null, DateTime? dateFrom = null, DateTime? dateTo = null)
        {
            APIResponse response = await _unitOfWork.CourseManagement.GetCourseFinancialReport<APIResponse>(courseId, year, dateFrom, dateTo);
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }
    }
}
