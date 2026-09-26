using System;
using System.Collections.Generic;

namespace ProjectWeb.Domain.DTO.CourseManagement
{
    // ==========================================
    // COURSE DTOs
    // ==========================================
    public class CourseDto
    {
        public long CourseId { get; set; }
        public string CourseCode { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateCourseDto
    {
        public string CourseCode { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }

    public class UpdateCourseDto
    {
        public long CourseId { get; set; }
        public string CourseCode { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }

    // ==========================================
    // COURSE BATCH DTOs
    // ==========================================
    public class CourseBatchDto
    {
        public long CourseBatchId { get; set; }
        public long CourseId { get; set; }
        public string? CourseName { get; set; }
        public string? CourseCode { get; set; }
        public int CourseYear { get; set; }
        public DateTime CourseStartDate { get; set; }
        public DateTime CourseEndDate { get; set; }
        public decimal TotalCourseFee { get; set; }
        public decimal AdvanceAmount { get; set; }
        public decimal CancellationRetentionAmount { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }

    public class CreateCourseBatchDto
    {
        public long CourseId { get; set; }
        public int CourseYear { get; set; }
        public DateTime CourseStartDate { get; set; }
        public DateTime CourseEndDate { get; set; }
        public decimal TotalCourseFee { get; set; }
        public decimal AdvanceAmount { get; set; }
        public decimal CancellationRetentionAmount { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class UpdateCourseBatchDto
    {
        public long CourseBatchId { get; set; }
        public long CourseId { get; set; }
        public int CourseYear { get; set; }
        public DateTime CourseStartDate { get; set; }
        public DateTime CourseEndDate { get; set; }
        public decimal TotalCourseFee { get; set; }
        public decimal AdvanceAmount { get; set; }
        public decimal CancellationRetentionAmount { get; set; }
        public bool IsActive { get; set; } = true;
    }

    // ==========================================
    // PERSON DTOs
    // ==========================================
    public class PersonDto
    {
        public long PersonId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string FullName { get => Name; set => Name = value; }
        public string Phone { get; set; } = string.Empty;
        public string PhoneNumber { get => Phone; set => Phone = value; }
        public string Email { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public DateTime? DateOfBirth { get; set; }
        public string FatherOrMotherName { get; set; } = string.Empty;
        public string FatherMotherName { get => FatherOrMotherName; set => FatherOrMotherName = value; }
        public string Address { get; set; } = string.Empty;
        public string Profession { get; set; } = string.Empty;
        public string MotherTongue { get; set; } = string.Empty;
        public string? Height { get; set; }
        public string? Weight { get; set; }
        public string BloodGroup { get; set; } = string.Empty;
        public string FoodHabit { get; set; } = string.Empty;
        public string PhysicalProblem { get; set; } = string.Empty;
    }

    // ==========================================
    // ENROLLMENT / PARTICIPANT DTOs
    // ==========================================
    public class CourseEnrollmentDto
    {
        public long CourseEnrollmentId { get; set; }
        public long EnrollmentId { get; set; }
        public string RegistrationNumber { get; set; } = string.Empty;
        public long PersonId { get; set; }
        public string ParticipantName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public long CourseBatchId { get; set; }
        public long CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public int CourseYear { get; set; }
        public DateTime RegistrationDate { get; set; } = DateTime.Now;
        public string ReferencePerson { get; set; } = string.Empty;
        public bool FormSubmitted { get; set; } = false;
        public string EnrollmentStatus { get; set; } = "REGISTERED"; // REGISTERED, CONFIRMED, CANCELLED, COMPLETED, WAITING
        public string Remarks { get; set; } = string.Empty;
        
        // Financial Information
        public decimal TotalCourseFee { get; set; }
        public decimal TotalPaid { get; set; }
        public decimal TotalDue { get; set; }
        public decimal TotalRefund { get; set; }
        public decimal NetReceived { get; set; }
        public string PaymentStatus { get; set; } = "PENDING"; // PENDING, PARTIAL, COMPLETED
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }

    public class CreateEnrollmentDto
    {
        public long CourseBatchId { get; set; }
        public DateTime RegistrationDate { get; set; } = DateTime.Now;
        public string ReferencePerson { get; set; } = string.Empty;
        public bool FormSubmitted { get; set; } = false;
        public string EnrollmentStatus { get; set; } = "REGISTERED";
        public string Remarks { get; set; } = string.Empty;

        // Person info (if creating new person)
        public long? PersonId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string FullName { get => Name; set => Name = value; }
        public string Phone { get; set; } = string.Empty;
        public string PhoneNumber { get => Phone; set => Phone = value; }
        public string Email { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public DateTime? DateOfBirth { get; set; }
        public string FatherOrMotherName { get; set; } = string.Empty;
        public string FatherMotherName { get => FatherOrMotherName; set => FatherOrMotherName = value; }
        public string Address { get; set; } = string.Empty;
        public string Profession { get; set; } = string.Empty;
        public string MotherTongue { get; set; } = string.Empty;
        public string? Height { get; set; }
        public string? Weight { get; set; }
        public string BloodGroup { get; set; } = string.Empty;
        public string FoodHabit { get; set; } = string.Empty;
        public string PhysicalProblem { get; set; } = string.Empty;

        // Initial Payment info (Optional upon registration)
        public decimal? PaymentAmount { get; set; }
        public decimal Amount { get => PaymentAmount ?? 0; set => PaymentAmount = value; }
        public decimal? InitialAmount { get => PaymentAmount; set => PaymentAmount = value; }
        public decimal? InitialPaymentAmount { get => PaymentAmount; set => PaymentAmount = value; }
        public decimal? PaidAmount { get => PaymentAmount; set => PaymentAmount = value; }
        public decimal? TotalPaid { get => PaymentAmount; set => PaymentAmount = value; }
        public decimal? AdvanceAmount { get => PaymentAmount; set => PaymentAmount = value; }

        public string? PaymentMode { get; set; }
        public string? InitialPaymentMode { get => PaymentMode; set => PaymentMode = value; }

        public string? PaymentReceiver { get; set; }
        public string? InitialPaymentReceiver { get => PaymentReceiver; set => PaymentReceiver = value; }

        public string? TransactionReference { get; set; }
        public string? InitialTxnRef { get => TransactionReference; set => TransactionReference = value; }
        public string? TxnRef { get => TransactionReference; set => TransactionReference = value; }

        public string? PaymentRemarks { get; set; }
        public DateTime? PaymentDate { get; set; }

        public long? PaymentId { get; set; }
        public UpdateCoursePaymentRequestDto? Payment { get; set; }
    }

    public class UpdateEnrollmentDto : CreateEnrollmentDto
    {
        public long CourseEnrollmentId { get; set; }
        public long EnrollmentId { get => CourseEnrollmentId; set => CourseEnrollmentId = value; }
        public long Id { get => CourseEnrollmentId; set => CourseEnrollmentId = value; }
    }

    public class EnrollmentDetailsDto
    {
        public CourseEnrollmentDto Enrollment { get; set; } = new();
        public PersonDto Person { get; set; } = new();
        public CourseBatchDto Batch { get; set; } = new();
        public List<CoursePaymentDto> Payments { get; set; } = new();
        public List<CourseRefundDto> Refunds { get; set; } = new();
    }

    // ==========================================
    // PAYMENT DTOs
    // ==========================================
    public class CoursePaymentDto
    {
        public long CoursePaymentId { get; set; }
        public long EnrollmentId { get; set; }
        public string RegistrationNumber { get; set; } = string.Empty;
        public string ParticipantName { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public int CourseYear { get; set; }
        public DateTime PaymentDate { get; set; } = DateTime.Now;
        public decimal Amount { get; set; }
        public string PaymentMode { get; set; } = "CASH";
        public string PaymentReceiver { get; set; } = string.Empty;
        public string TransactionReference { get; set; } = string.Empty;
        public string Remarks { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }

    public class AddPaymentDto
    {
        public long EnrollmentId { get; set; }
        public DateTime PaymentDate { get; set; } = DateTime.Now;
        public decimal Amount { get; set; }
        public string PaymentMode { get; set; } = "CASH";
        public string PaymentReceiver { get; set; } = string.Empty;
        public string TransactionReference { get; set; } = string.Empty;
        public string Remarks { get; set; } = string.Empty;
    }

    public class UpdateCoursePaymentRequestDto
    {
        public long PaymentId { get; set; }
        public long CoursePaymentId { get => PaymentId; set => PaymentId = value; }
        public long Id { get => PaymentId; set => PaymentId = value; }
        public DateTime PaymentDate { get; set; } = DateTime.Now;
        public decimal Amount { get; set; }
        public string PaymentMode { get; set; } = "CASH";
        public string PaymentReceiver { get; set; } = string.Empty;
        public string TransactionReference { get; set; } = string.Empty;
        public string Remarks { get; set; } = string.Empty;
    }

    public class UpdatePaymentDto : UpdateCoursePaymentRequestDto
    {
    }

    // ==========================================
    // REFUND DTOs
    // ==========================================
    public class CourseRefundDto
    {
        public long CourseRefundId { get; set; }
        public long EnrollmentId { get; set; }
        public string RegistrationNumber { get; set; } = string.Empty;
        public string ParticipantName { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public int CourseYear { get; set; }
        public DateTime RefundDate { get; set; } = DateTime.Now;
        public decimal TotalPaid { get; set; }
        public decimal RetentionAmount { get; set; }
        public decimal RefundAmount { get; set; }
        public string RefundMode { get; set; } = "CASH";
        public string Reason { get; set; } = string.Empty;
        public string TransactionReference { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }

    public class CancelEnrollmentDto
    {
        public long EnrollmentId { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string RefundMode { get; set; } = "CASH";
        public string TransactionReference { get; set; } = string.Empty;
    }

    // ==========================================
    // OFFICIAL DTOs
    // ==========================================
    public class CourseOfficialDto
    {
        public long CourseOfficialId { get; set; }
        public long PersonId { get; set; }
        public string OfficialName { get; set; } = string.Empty;
        public long CourseBatchId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public int CourseYear { get; set; }
        public string Role { get; set; } = string.Empty;
        public string RoleName { get => Role; set => Role = value; }
        public string HowrahToDestination { get; set; } = "0";
        public string DestinationToHowrah { get; set; } = "0";
        public decimal Amount { get; set; }
        public string PaymentStatus { get; set; } = "PENDING"; // PENDING, PAID
        public string Remarks { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }

    public class AddCourseOfficialDto
    {
        public long PersonId { get; set; }
        public string OfficialName { get; set; } = string.Empty;
        public string CourseOfficialName { get; set; } = string.Empty;
        public long? CourseId { get; set; } = 0;
        public long CourseBatchId { get; set; }
        public string Role { get; set; } = string.Empty;
        public string RoleName { get => Role; set => Role = value; }
        public string HowrahToDestination { get; set; } = "0";
        public string DestinationToHowrah { get; set; } = "0";
        public decimal Amount { get; set; }
        public string PaymentStatus { get; set; } = "PENDING";
        public string Remarks { get; set; } = string.Empty;
    }

    public class UpdateCourseOfficialDto : AddCourseOfficialDto
    {
        public long CourseOfficialId { get; set; }
    }

    public class UpdateOfficialPaymentStatusDto
    {
        public long CourseOfficialId { get; set; }
        public string PaymentStatus { get; set; } = "PAID";
    }

    // ==========================================
    // EXPENSE DTOs
    // ==========================================
    public class CourseExpenseDto
    {
        public long CourseExpenseId { get; set; }
        public long CourseBatchId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public int CourseYear { get; set; }
        public DateTime ExpenseDate { get; set; } = DateTime.Now;
        public string ExpenseCategory { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string PaidBy { get; set; } = string.Empty;
        public string PaymentMode { get; set; } = "CASH";
        public string Remarks { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }

    public class AddCourseExpenseDto
    {
        public long CourseBatchId { get; set; }
        public DateTime ExpenseDate { get; set; } = DateTime.Now;
        public string ExpenseCategory { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string PaidBy { get; set; } = string.Empty;
        public string PaymentMode { get; set; } = "CASH";
        public string Remarks { get; set; } = string.Empty;
    }

    public class UpdateCourseExpenseDto : AddCourseExpenseDto
    {
        public long CourseExpenseId { get; set; }
    }

    // ==========================================
    // REPORT / DASHBOARD DTOs
    // ==========================================
    public class CourseDashboardSummaryDto
    {
        public int TotalCourses { get; set; }
        public int TotalBatches { get; set; }
        public int TotalParticipants { get; set; }
        public decimal TotalCollection { get; set; }
        public decimal TotalDue { get; set; }
        public decimal TotalRefund { get; set; }
        public decimal TotalExpense { get; set; }
        public decimal TotalOfficialPaid { get; set; }
        public decimal TotalOfficialPending { get; set; }
        public decimal NetCourseIncome { get; set; }

        public int TotalRegistrations { get; set; }
        public int RegisteredCount { get; set; }
        public int ConfirmedCount { get; set; }
        public int CancelledCount { get; set; }
        public int CompletedCount { get; set; }
        public int WaitingCount { get; set; }
    }

    public class SegmentSummaryDto
    {
        public long CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public int ParticipantCount { get; set; }
        public decimal TotalCollected { get; set; }
        public decimal TotalDue { get; set; }
        public decimal TotalRefund { get; set; }
        public decimal TotalExpense { get; set; }
        public decimal TotalOfficialPaid { get; set; }
        public decimal NetIncome { get; set; }
    }

    public class YearWiseSummaryDto
    {
        public int CourseYear { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public int ParticipantCount { get; set; }
        public decimal TotalCollected { get; set; }
        public decimal TotalRefund { get; set; }
        public decimal TotalExpense { get; set; }
        public decimal NetIncome { get; set; }
    }

    public class CourseFinancialReportDto
    {
        public CourseDashboardSummaryDto Summary { get; set; } = new();
        public List<SegmentSummaryDto> SegmentSummaries { get; set; } = new();
        public List<YearWiseSummaryDto> YearWiseSummaries { get; set; } = new();
    }
}
