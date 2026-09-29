using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using ProjectWeb.Application.Common.Repository.Master;
using ProjectWeb.Domain.DTO.CourseManagement;
using ProjectWeb.Domain.Utility;
using ProjectWeb.WEB.Services;
using System;
using System.Collections.Generic;
using System.Linq;
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
            if (dto != null)
            {
                var initialPay = dto.PaymentAmount ?? dto.Amount;
                if (initialPay > 0)
                {
                    dto.EnrollmentStatus = "CONFIRMED";
                }
                else if (string.IsNullOrEmpty(dto.EnrollmentStatus) || dto.EnrollmentStatus == "CONFIRMED")
                {
                    dto.EnrollmentStatus = "REGISTERED";
                }
            }

            APIResponse response = await _unitOfWork.CourseManagement.CreateEnrollment<APIResponse>(dto);

            if (response != null && response.Success && dto != null && ((dto.PaymentAmount ?? 0) > 0 || dto.Amount > 0))
            {
                try
                {
                    long newEnrollmentId = 0;
                    if (response.Response != null)
                    {
                        var respStr = response.Response.ToString()?.Trim();
                        if (long.TryParse(respStr, out long parsedId))
                        {
                            newEnrollmentId = parsedId;
                        }
                        else
                        {
                            var respJson = JsonConvert.SerializeObject(response.Response);
                            var enrollObj = JsonConvert.DeserializeObject<CourseEnrollmentDto>(respJson);
                            newEnrollmentId = enrollObj?.CourseEnrollmentId > 0 ? enrollObj.CourseEnrollmentId : (enrollObj?.EnrollmentId ?? 0);
                        }
                    }

                    if (newEnrollmentId > 0)
                    {
                        var updateDto = new UpdateEnrollmentDto
                        {
                            CourseEnrollmentId = newEnrollmentId,
                            CourseBatchId = dto.CourseBatchId,
                            PersonId = dto.PersonId,
                            Name = dto.Name,
                            Phone = dto.Phone,
                            Email = dto.Email,
                            Gender = dto.Gender,
                            DateOfBirth = dto.DateOfBirth,
                            FatherMotherName = dto.FatherMotherName,
                            Address = dto.Address,
                            Profession = dto.Profession,
                            BloodGroup = dto.BloodGroup,
                            FoodHabit = dto.FoodHabit,
                            Height = dto.Height,
                            Weight = dto.Weight,
                            PhysicalProblem = dto.PhysicalProblem,
                            EnrollmentStatus = "CONFIRMED",
                            FormSubmitted = dto.FormSubmitted,
                            Remarks = dto.Remarks,
                            ReferencePerson = dto.ReferencePerson,
                            RegistrationDate = dto.RegistrationDate
                        };
                        await _unitOfWork.CourseManagement.UpdateEnrollment<APIResponse>(updateDto);
                        _logger.LogInformation("[CreateEnrollment] Confirmed enrollment Id={Id} after initial payment", newEnrollmentId);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "[CreateEnrollment] Post-creation confirm update failed");
                }
            }

            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpPost]
        public async Task<IActionResult> UpdateEnrollment([FromBody] UpdateEnrollmentDto dto)
        {
            try
            {
                if (dto == null)
                {
                    return BadRequest(new APIResponse
                    {
                        Success = false,
                        StatusCode = System.Net.HttpStatusCode.BadRequest,
                        Response = "Invalid enrollment payload."
                    });
                }

                var enrollmentId = dto.CourseEnrollmentId > 0 ? dto.CourseEnrollmentId : dto.EnrollmentId;

                // Sanitize DateTime fields to prevent SQL Server DateTime underflow
                if (dto.DateOfBirth.HasValue && dto.DateOfBirth.Value.Year < 1900)
                {
                    dto.DateOfBirth = null;
                }
                if (dto.RegistrationDate.Year < 1900)
                {
                    dto.RegistrationDate = DateTime.Now;
                }
                if (dto.PaymentDate.HasValue && dto.PaymentDate.Value.Year < 1900)
                {
                    dto.PaymentDate = DateTime.Now;
                }

                _logger.LogInformation("[UpdateEnrollment] Updating enrollment Id={Id}, Name={Name}, Status={Status}, BatchId={BatchId}",
                    enrollmentId, dto.Name, dto.EnrollmentStatus, dto.CourseBatchId);

                APIResponse response = await _unitOfWork.CourseManagement.UpdateEnrollment<APIResponse>(dto);

                if (response != null && !response.Success)
                {
                    _logger.LogWarning("[UpdateEnrollment] Failed for Id={Id}: {Errors}",
                        enrollmentId,
                        string.Join("; ", response.ErrorMassage ?? new List<string>()));
                }

                return Content(JsonConvert.SerializeObject(response), "application/json");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[UpdateEnrollment] Exception updating enrollment");
                return StatusCode(StatusCodes.Status500InternalServerError, new APIResponse
                {
                    Success = false,
                    StatusCode = System.Net.HttpStatusCode.InternalServerError,
                    Response = ex.Message
                });
            }
        }

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpPost]
        public async Task<IActionResult> ReconfirmEnrollment([FromBody] ReconfirmEnrollmentRequest request)
        {
            try
            {
                if (request == null || request.EnrollmentId <= 0)
                {
                    return BadRequest(new APIResponse
                    {
                        Success = false,
                        StatusCode = System.Net.HttpStatusCode.BadRequest,
                        Response = "Invalid enrollment ID."
                    });
                }

                _logger.LogInformation("[ReconfirmEnrollment] Re-confirming enrollment Id={Id}", request.EnrollmentId);

                // Use GetEnrollmentDetails to get Person + Batch data in one call
                APIResponse detailsResponse = await _unitOfWork.CourseManagement.GetEnrollmentDetails<APIResponse>(request.EnrollmentId);

                if (detailsResponse == null || detailsResponse.Response == null || !detailsResponse.Success)
                {
                    _logger.LogWarning("[ReconfirmEnrollment] GetEnrollmentDetails failed for Id={Id}, falling back to GetEnrollmentById", request.EnrollmentId);
                    detailsResponse = await _unitOfWork.CourseManagement.GetEnrollmentById<APIResponse>(request.EnrollmentId);
                }

                if (detailsResponse == null || detailsResponse.Response == null)
                {
                    return Content(JsonConvert.SerializeObject(new APIResponse
                    {
                        Success = false,
                        StatusCode = System.Net.HttpStatusCode.NotFound,
                        Response = "Enrollment not found."
                    }), "application/json");
                }

                var detailsJson = detailsResponse.Response is string s
                    ? s
                    : JsonConvert.SerializeObject(detailsResponse.Response);

                CourseEnrollmentDto? enrollment = null;
                PersonDto? person = null;
                CourseBatchDto? batch = null;

                try
                {
                    var detailsObj = JsonConvert.DeserializeObject<EnrollmentDetailsDto>(detailsJson);
                    if (detailsObj != null)
                    {
                        enrollment = detailsObj.Enrollment;
                        person = detailsObj.Person;
                        batch = detailsObj.Batch;
                    }
                }
                catch { }

                if (enrollment == null || (enrollment.CourseEnrollmentId == 0 && enrollment.EnrollmentId == 0))
                {
                    enrollment = JsonConvert.DeserializeObject<CourseEnrollmentDto>(detailsJson);
                }

                if (enrollment == null)
                {
                    return Content(JsonConvert.SerializeObject(new APIResponse
                    {
                        Success = false,
                        StatusCode = System.Net.HttpStatusCode.NotFound,
                        Response = "Could not parse enrollment data."
                    }), "application/json");
                }

                var enrollmentId = enrollment.CourseEnrollmentId > 0 ? enrollment.CourseEnrollmentId : request.EnrollmentId;
                var batchId = enrollment.CourseBatchId > 0 ? enrollment.CourseBatchId : (batch?.CourseBatchId ?? 0);
                var personId = person?.PersonId > 0 ? person.PersonId : (enrollment.PersonId > 0 ? (long?)enrollment.PersonId : null);

                var updateDto = new UpdateEnrollmentDto
                {
                    CourseEnrollmentId = enrollmentId,
                    PersonId = personId,
                    CourseBatchId = batchId,
                    Name = !string.IsNullOrEmpty(person?.FullName) ? person.FullName : (!string.IsNullOrEmpty(enrollment.ParticipantName) ? enrollment.ParticipantName : ""),
                    Phone = !string.IsNullOrEmpty(person?.PhoneNumber) ? person.PhoneNumber : (!string.IsNullOrEmpty(enrollment.Phone) ? enrollment.Phone : ""),
                    Email = person?.Email ?? enrollment.Email ?? "",
                    Gender = !string.IsNullOrEmpty(person?.Gender) ? person.Gender : "MALE",
                    DateOfBirth = person?.DateOfBirth.HasValue == true && person.DateOfBirth.Value.Year >= 1900 ? person.DateOfBirth : null,
                    FatherMotherName = person?.FatherMotherName ?? "",
                    Address = person?.Address ?? "",
                    Profession = person?.Profession ?? "",
                    BloodGroup = person?.BloodGroup ?? "",
                    FoodHabit = !string.IsNullOrEmpty(person?.FoodHabit) ? person.FoodHabit : "VEG",
                    Height = person?.Height,
                    Weight = person?.Weight,
                    PhysicalProblem = person?.PhysicalProblem ?? "",
                    EnrollmentStatus = "CONFIRMED",
                    FormSubmitted = enrollment.FormSubmitted,
                    Remarks = (enrollment.Remarks ?? "").Trim(),
                    ReferencePerson = enrollment.ReferencePerson ?? "",
                    RegistrationDate = enrollment.RegistrationDate.Year >= 1900 ? enrollment.RegistrationDate : DateTime.Now
                };

                APIResponse updateResponse = await _unitOfWork.CourseManagement.UpdateEnrollment<APIResponse>(updateDto);
                return Content(JsonConvert.SerializeObject(updateResponse), "application/json");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[ReconfirmEnrollment] Exception re-confirming enrollment Id={Id}", request?.EnrollmentId);
                return Content(JsonConvert.SerializeObject(new APIResponse
                {
                    Success = false,
                    StatusCode = System.Net.HttpStatusCode.BadRequest,
                    Response = $"Re-confirmation failed: {ex.Message}"
                }), "application/json");
            }
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

            // Auto-confirm enrollment when payment is complete
            if (response != null && response.Success && dto.EnrollmentId > 0)
            {
                try
                {
                    // Use GetEnrollmentDetails — returns a richer object with all required fields
                    var detailsResponse = await _unitOfWork.CourseManagement.GetEnrollmentDetails<APIResponse>(dto.EnrollmentId);

                    _logger.LogInformation(
                        "[AddPayment] Details fetch for {Id}: Success={Ok}, ResponseType={Type}",
                        dto.EnrollmentId,
                        detailsResponse?.Success,
                        detailsResponse?.Response?.GetType()?.Name ?? "null");

                    if (detailsResponse?.Success == true && detailsResponse.Response != null)
                    {
                        // Unwrap — API sometimes returns nested { Enrollment: {...} } or flat
                        var detailsJson = detailsResponse.Response is string s
                            ? s
                            : JsonConvert.SerializeObject(detailsResponse.Response);

                        _logger.LogDebug("[AddPayment] Details JSON (first 500): {Json}",
                            detailsJson.Length > 500 ? detailsJson[..500] : detailsJson);

                        // Try to parse as EnrollmentDetailsDto (nested) first, then flat
                        CourseEnrollmentDto? enrollment = null;
                        try
                        {
                            var detailsObj = JsonConvert.DeserializeObject<EnrollmentDetailsDto>(detailsJson);
                            enrollment = detailsObj?.Enrollment;
                            // If nested Enrollment is empty (no ID), fallback
                            if (enrollment?.CourseEnrollmentId == 0 && enrollment?.EnrollmentId == 0)
                                enrollment = null;
                        }
                        catch { /* ignore, try flat next */ }

                        // Fallback: try flat deserialization
                        if (enrollment == null || (enrollment.CourseEnrollmentId == 0 && enrollment.EnrollmentId == 0))
                        {
                            enrollment = JsonConvert.DeserializeObject<CourseEnrollmentDto>(detailsJson);
                        }

                        if (enrollment != null)
                        {
                            var totalPaid = enrollment.TotalPaid;
                            var totalFee = enrollment.TotalCourseFee;
                            var currentStatus = (enrollment.EnrollmentStatus ?? enrollment.Status ?? "REGISTERED").ToUpperInvariant().Trim();

                            _logger.LogInformation(
                                "[AddPayment] Enrollment {Id} — TotalPaid={Paid}, TotalFee={Fee}, Status={Status}",
                                dto.EnrollmentId, totalPaid, totalFee, currentStatus);

                            bool paymentComplete = totalFee > 0 && totalPaid >= totalFee;
                            bool canAutoConfirm = paymentComplete
                                && currentStatus != "CONFIRMED"
                                && currentStatus != "CANCELLED"
                                && currentStatus != "COMPLETED";

                            _logger.LogInformation(
                                "[AddPayment] PaymentComplete={Complete}, CanAutoConfirm={Confirm}",
                                paymentComplete, canAutoConfirm);

                            if (canAutoConfirm)
                            {
                                // Populate all required fields so the API doesn't reject the update
                                var updateDto = new UpdateEnrollmentDto
                                {
                                    CourseEnrollmentId = enrollment.CourseEnrollmentId > 0
                                        ? enrollment.CourseEnrollmentId
                                        : enrollment.EnrollmentId,
                                    CourseBatchId   = enrollment.CourseBatchId,
                                    Name            = enrollment.ParticipantName ?? "",
                                    Phone           = enrollment.Phone ?? "",
                                    Email           = enrollment.Email ?? "",
                                    EnrollmentStatus = "CONFIRMED",
                                    FormSubmitted   = enrollment.FormSubmitted,
                                    Remarks         = enrollment.Remarks ?? "",
                                    ReferencePerson = enrollment.ReferencePerson ?? "",
                                    RegistrationDate = enrollment.RegistrationDate != default
                                        ? enrollment.RegistrationDate
                                        : DateTime.Now
                                };

                                var confirmResponse = await _unitOfWork.CourseManagement.UpdateEnrollment<APIResponse>(updateDto);

                                _logger.LogInformation(
                                    "[AddPayment] Auto-confirm result for enrollment {Id}: Success={Ok}, Errors={Err}",
                                    dto.EnrollmentId,
                                    confirmResponse?.Success,
                                    string.Join("; ", confirmResponse?.ErrorMassage ?? new System.Collections.Generic.List<string>()));

                                var responseObj = new
                                {
                                    response.StatusCode,
                                    response.Success,
                                    response.ErrorMassage,
                                    response.Response,
                                    response.TotalItem,
                                    StatusAutoConfirmed = confirmResponse?.Success == true
                                };
                                return Content(JsonConvert.SerializeObject(responseObj), "application/json");
                            }
                        }
                        else
                        {
                            _logger.LogWarning("[AddPayment] Could not parse enrollment from details response for {Id}", dto.EnrollmentId);
                        }
                    }
                    else
                    {
                        _logger.LogWarning("[AddPayment] GetEnrollmentDetails returned no data for {Id}. Success={Ok}",
                            dto.EnrollmentId, detailsResponse?.Success);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "[AddPayment] Auto-confirm failed for enrollment {Id}", dto.EnrollmentId);
                }
            }

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
            APIResponse response = await _unitOfWork.CourseManagement.GetAllCourseOfficial<APIResponse>(5, year, role, paymentStatus, pageNumber, pageSize, search);
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

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpPost]
        public IActionResult ExportCourseExcelReport([FromBody] CourseExcelExportRequestDto dto)
        {
            try
            {
                var enrollments = dto?.Enrollments ?? new List<CourseEnrollmentDto>();
                var payments = dto?.Payments ?? new List<CoursePaymentDto>();
                var refunds = dto?.Refunds ?? new List<CourseRefundDto>();
                var officials = dto?.Officials ?? new List<CourseOfficialDto>();
                var expenses = dto?.Expenses ?? new List<CourseExpenseDto>();
                int year = dto?.Year ?? DateTime.Now.Year;

                _logger.LogInformation("ExportCourseExcelReport (POST): Received {E} enrollments, {P} payments, {R} refunds, {O} officials, {X} expenses for year {Y}",
                    enrollments.Count, payments.Count, refunds.Count, officials.Count, expenses.Count, year);

                var service = new CourseExcelExportService();
                byte[] fileBytes = service.GenerateReport(enrollments, payments, refunds, officials, expenses, year);

                string fileName = $"ClimbersCircle_CourseReport_{year}_{DateTime.Now:yyyyMMdd}.xlsx";
                return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating Course Excel report (POST)");
                return StatusCode(500, "Error generating report: " + ex.Message);
            }
        }

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpGet]
        public async Task<IActionResult> ExportCourseExcelReport(long? courseId = null, int? year = null, DateTime? dateFrom = null, DateTime? dateTo = null)
        {
            try
            {
                _logger.LogInformation("ExportCourseExcelReport (GET): courseId={C}, year={Y}, dateFrom={DF}, dateTo={DT}", courseId, year, dateFrom, dateTo);

                // Fetch enrollments (do not filter by date range so full roster is captured, matching UI behavior)
                APIResponse enrollRes = await _unitOfWork.CourseManagement.GetAllEnrollment<APIResponse>(courseId, year, null, null, null, null, null, 1, 10000, "");
                var enrollments = DeserializeList<CourseEnrollmentDto>(enrollRes);

                // If year filter returned 0, try without year as fallback
                if (enrollments.Count == 0 && year.HasValue)
                {
                    APIResponse allEnrollRes = await _unitOfWork.CourseManagement.GetAllEnrollment<APIResponse>(courseId, null, null, null, null, null, null, 1, 10000, "");
                    var fallbackEnroll = DeserializeList<CourseEnrollmentDto>(allEnrollRes);
                    if (fallbackEnroll.Count > 0) enrollments = fallbackEnroll;
                }

                APIResponse payRes = await _unitOfWork.CourseManagement.GetAllPayment<APIResponse>(courseId, year, null, dateFrom, dateTo, 1, 10000, "");
                var payments = DeserializeList<CoursePaymentDto>(payRes);
                if (payments.Count == 0 && year.HasValue)
                {
                    APIResponse allPayRes = await _unitOfWork.CourseManagement.GetAllPayment<APIResponse>(courseId, null, null, dateFrom, dateTo, 1, 10000, "");
                    var fallbackPay = DeserializeList<CoursePaymentDto>(allPayRes);
                    if (fallbackPay.Count > 0) payments = fallbackPay;
                }

                APIResponse refRes = await _unitOfWork.CourseManagement.GetAllRefund<APIResponse>(courseId, year, null, null, 1, 10000, "");
                var refunds = DeserializeList<CourseRefundDto>(refRes);

                // Officials are stored under courseId=5
                APIResponse offRes = await _unitOfWork.CourseManagement.GetAllCourseOfficial<APIResponse>(5, year, null, null, 1, 10000, "");
                var officials = DeserializeList<CourseOfficialDto>(offRes);
                if (officials.Count == 0 && year.HasValue)
                {
                    APIResponse allOffRes = await _unitOfWork.CourseManagement.GetAllCourseOfficial<APIResponse>(5, null, null, null, 1, 10000, "");
                    var fallbackOff = DeserializeList<CourseOfficialDto>(allOffRes);
                    if (fallbackOff.Count > 0) officials = fallbackOff;
                }

                APIResponse expRes = await _unitOfWork.CourseManagement.GetAllCourseExpense<APIResponse>(courseId, year, null, null, dateFrom, dateTo, 1, 10000, "");
                var expenses = DeserializeList<CourseExpenseDto>(expRes);
                if (expenses.Count == 0 && year.HasValue)
                {
                    APIResponse allExpRes = await _unitOfWork.CourseManagement.GetAllCourseExpense<APIResponse>(courseId, null, null, null, dateFrom, dateTo, 1, 10000, "");
                    var fallbackExp = DeserializeList<CourseExpenseDto>(allExpRes);
                    if (fallbackExp.Count > 0) expenses = fallbackExp;
                }

                _logger.LogInformation("ExportCourseExcelReport (GET) resolved: {E} enrollments, {P} payments, {R} refunds, {O} officials, {X} expenses",
                    enrollments.Count, payments.Count, refunds.Count, officials.Count, expenses.Count);

                var service = new CourseExcelExportService();
                byte[] fileBytes = service.GenerateReport(enrollments, payments, refunds, officials, expenses, year);

                string fileName = $"ClimbersCircle_CourseReport_{year ?? DateTime.Now.Year}_{DateTime.Now:yyyyMMdd}.xlsx";
                return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating Course Excel report (GET)");
                return StatusCode(500, "Error generating report: " + ex.Message);
            }
        }

        private static List<T> DeserializeList<T>(APIResponse? response)
        {
            if (response?.Response == null) return new List<T>();

            try
            {
                object raw = response.Response;

                // 1. If it's already a JArray
                if (raw is Newtonsoft.Json.Linq.JArray jArr)
                {
                    return jArr.ToObject<List<T>>() ?? new List<T>();
                }

                // 2. If it's a JObject (e.g. paged wrapper)
                if (raw is Newtonsoft.Json.Linq.JObject jObj)
                {
                    var token = jObj["data"] ?? jObj["Data"] ?? jObj["items"] ?? jObj["Items"] ?? jObj["list"] ?? jObj["List"] ?? jObj["records"] ?? jObj["Records"] ?? jObj["Response"] ?? jObj["response"];
                    if (token is Newtonsoft.Json.Linq.JArray innerArr)
                    {
                        return innerArr.ToObject<List<T>>() ?? new List<T>();
                    }
                    if (token != null)
                    {
                        var s = token.ToString().Trim();
                        if (s.StartsWith("["))
                            return JsonConvert.DeserializeObject<List<T>>(s) ?? new List<T>();
                    }
                    return new List<T>();
                }

                // 3. If it's a raw string from BaseService apiContent
                string jsonStr = raw is string sRaw ? sRaw : JsonConvert.SerializeObject(raw);
                if (string.IsNullOrWhiteSpace(jsonStr)) return new List<T>();

                var trimmed = jsonStr.Trim();
                if (trimmed.StartsWith("["))
                {
                    return JsonConvert.DeserializeObject<List<T>>(trimmed) ?? new List<T>();
                }

                if (trimmed.StartsWith("{"))
                {
                    var parsed = Newtonsoft.Json.Linq.JObject.Parse(trimmed);
                    var token = parsed["data"] ?? parsed["Data"] ?? parsed["items"] ?? parsed["Items"] ?? parsed["list"] ?? parsed["List"] ?? parsed["records"] ?? parsed["Records"] ?? parsed["Response"] ?? parsed["response"];
                    if (token is Newtonsoft.Json.Linq.JArray innerArr)
                    {
                        return innerArr.ToObject<List<T>>() ?? new List<T>();
                    }
                    if (token != null)
                    {
                        var s = token.ToString().Trim();
                        if (s.StartsWith("["))
                            return JsonConvert.DeserializeObject<List<T>>(s) ?? new List<T>();
                    }
                }

                return new List<T>();
            }
            catch
            {
                return new List<T>();
            }
        }
    }
}
