using System;
using System.Threading.Tasks;
using ProjectWeb.Domain.DTO.CourseManagement;

namespace ProjectWeb.Application.Common.Repository
{
    public interface ICourseManagementRepository
    {
        // ==========================================
        // COURSE
        // ==========================================
        Task<T> CreateCourse<T>(CreateCourseDto dto);
        Task<T> UpdateCourse<T>(UpdateCourseDto dto);
        Task<T> GetAllCourse<T>(int pageNumber = 1, int pageSize = 10, string search = "", bool? isActive = null);
        Task<T> GetCourseById<T>(long id);

        // ==========================================
        // COURSE BATCH
        // ==========================================
        Task<T> CreateCourseBatch<T>(CreateCourseBatchDto dto);
        Task<T> UpdateCourseBatch<T>(UpdateCourseBatchDto dto);
        Task<T> GetAllCourseBatch<T>(long? courseId = null, int? year = null, bool? isActive = null, int pageNumber = 1, int pageSize = 10, string search = "");
        Task<T> GetCourseBatchById<T>(long id);

        // ==========================================
        // ENROLLMENT / PARTICIPANT
        // ==========================================
        Task<T> CreateEnrollment<T>(CreateEnrollmentDto dto);
        Task<T> UpdateEnrollment<T>(UpdateEnrollmentDto dto);
        Task<T> GetAllEnrollment<T>(long? courseId = null, int? year = null, string? status = null, string? paymentStatus = null, bool? formSubmitted = null, DateTime? dateFrom = null, DateTime? dateTo = null, int pageNumber = 1, int pageSize = 10, string search = "");
        Task<T> GetEnrollmentById<T>(long id);
        Task<T> GetEnrollmentDetails<T>(long id);

        // ==========================================
        // PAYMENT
        // ==========================================
        Task<T> AddPayment<T>(AddPaymentDto dto);
        Task<T> UpdatePayment<T>(UpdateCoursePaymentRequestDto dto);
        Task<T> GetEnrollmentPayments<T>(long enrollmentId);
        Task<T> GetAllPayment<T>(long? courseId = null, int? year = null, string? paymentMode = null, DateTime? dateFrom = null, DateTime? dateTo = null, int pageNumber = 1, int pageSize = 10, string search = "");

        // ==========================================
        // REFUND / CANCELLATION
        // ==========================================
        Task<T> CancelEnrollment<T>(CancelEnrollmentDto dto);
        Task<T> GetEnrollmentRefunds<T>(long enrollmentId);
        Task<T> GetAllRefund<T>(long? courseId = null, int? year = null, string? refundMode = null, DateTime? refundDate = null, int pageNumber = 1, int pageSize = 10, string search = "");

        // ==========================================
        // OFFICIALS
        // ==========================================
        Task<T> AddCourseOfficial<T>(AddCourseOfficialDto dto);
        Task<T> UpdateCourseOfficial<T>(UpdateCourseOfficialDto dto);
        Task<T> GetAllCourseOfficial<T>(long? courseId = null, int? year = null, string? role = null, string? paymentStatus = null, int pageNumber = 1, int pageSize = 10, string search = "");
        Task<T> GetCourseOfficialById<T>(long id);
        Task<T> UpdateCourseOfficialPaymentStatus<T>(long id, string paymentStatus);

        // ==========================================
        // EXPENSE
        // ==========================================
        Task<T> AddCourseExpense<T>(AddCourseExpenseDto dto);
        Task<T> UpdateCourseExpense<T>(UpdateCourseExpenseDto dto);
        Task<T> GetAllCourseExpense<T>(long? courseId = null, int? year = null, string? category = null, string? paymentMode = null, DateTime? dateFrom = null, DateTime? dateTo = null, int pageNumber = 1, int pageSize = 10, string search = "");
        Task<T> GetCourseExpenseById<T>(long id);

        // ==========================================
        // REPORT / DASHBOARD
        // ==========================================
        Task<T> GetCourseDashboard<T>(long? courseId = null, int? year = null, DateTime? dateFrom = null, DateTime? dateTo = null);
        Task<T> GetCourseSummaryBySegment<T>(int? year = null, DateTime? dateFrom = null, DateTime? dateTo = null);
        Task<T> GetYearWiseCourseSummary<T>(int? fromYear = null, int? toYear = null);
        Task<T> GetCourseFinancialReport<T>(long? courseId = null, int? year = null, DateTime? dateFrom = null, DateTime? dateTo = null);
    }
}
