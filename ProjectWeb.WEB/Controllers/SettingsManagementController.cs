using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using ProjectWeb.Application.Common.Repository.Master;
using ProjectWeb.Domain.DTO.SettingsManagement;
using ProjectWeb.Domain.Utility;
using System;
using System.Net;
using System.Threading.Tasks;

namespace ProjectWeb.WEB.Controllers
{
    [Authorize(Roles = "Developer,Administrator,2")]
    public class SettingsManagementController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<SettingsManagementController> _logger;

        public SettingsManagementController(IUnitOfWork unitOfWork, ILogger<SettingsManagementController> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        // ==========================================
        // RAZOR VIEW ACTIONS
        // ==========================================

        public IActionResult Index()
        {
            return RedirectToAction(nameof(CourseAccountants));
        }

        public IActionResult CourseAccountants()
        {
            return View();
        }

        public IActionResult CourseExpenseCategories()
        {
            return View();
        }

        // ==========================================
        // COURSE ACCOUNTANT AJAX API PROXIES
        // ==========================================

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAllCourseAccountants()
        {
            try
            {
                APIResponse response = await _unitOfWork.SettingsManagement.GetAllCourseAccountant<APIResponse>();
                return Content(JsonConvert.SerializeObject(response), "application/json");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all course accountants");
                var errorResponse = new APIResponse
                {
                    Success = false,
                    StatusCode = HttpStatusCode.InternalServerError,
                    ErrorMassage = { ex.Message }
                };
                return Content(JsonConvert.SerializeObject(errorResponse), "application/json");
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetCourseAccountantById(long id)
        {
            try
            {
                if (id <= 0)
                {
                    var invalidResponse = new APIResponse
                    {
                        Success = false,
                        StatusCode = HttpStatusCode.BadRequest,
                        ErrorMassage = { "Invalid accountant ID." }
                    };
                    return Content(JsonConvert.SerializeObject(invalidResponse), "application/json");
                }

                APIResponse response = await _unitOfWork.SettingsManagement.GetCourseAccountantById<APIResponse>(id);
                return Content(JsonConvert.SerializeObject(response), "application/json");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting course accountant by id {Id}", id);
                var errorResponse = new APIResponse
                {
                    Success = false,
                    StatusCode = HttpStatusCode.InternalServerError,
                    ErrorMassage = { ex.Message }
                };
                return Content(JsonConvert.SerializeObject(errorResponse), "application/json");
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateCourseAccountant([FromBody] CreateCourseAccountantDto dto)
        {
            try
            {
                if (dto == null || string.IsNullOrWhiteSpace(dto.Name))
                {
                    var invalidResponse = new APIResponse
                    {
                        Success = false,
                        StatusCode = HttpStatusCode.BadRequest,
                        ErrorMassage = { "Accountant name is required." }
                    };
                    return Content(JsonConvert.SerializeObject(invalidResponse), "application/json");
                }

                dto.Name = dto.Name.Trim();
                APIResponse response = await _unitOfWork.SettingsManagement.CreateCourseAccountant<APIResponse>(dto);
                return Content(JsonConvert.SerializeObject(response), "application/json");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating course accountant");
                var errorResponse = new APIResponse
                {
                    Success = false,
                    StatusCode = HttpStatusCode.InternalServerError,
                    ErrorMassage = { ex.Message }
                };
                return Content(JsonConvert.SerializeObject(errorResponse), "application/json");
            }
        }

        [HttpPut]
        public async Task<IActionResult> UpdateCourseAccountant([FromBody] UpdateCourseAccountantDto dto)
        {
            try
            {
                if (dto == null || dto.CourseAccountantId <= 0 || string.IsNullOrWhiteSpace(dto.Name))
                {
                    var invalidResponse = new APIResponse
                    {
                        Success = false,
                        StatusCode = HttpStatusCode.BadRequest,
                        ErrorMassage = { "Valid accountant ID and name are required." }
                    };
                    return Content(JsonConvert.SerializeObject(invalidResponse), "application/json");
                }

                dto.Name = dto.Name.Trim();
                APIResponse response = await _unitOfWork.SettingsManagement.UpdateCourseAccountant<APIResponse>(dto);
                return Content(JsonConvert.SerializeObject(response), "application/json");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating course accountant {Id}", dto?.CourseAccountantId);
                var errorResponse = new APIResponse
                {
                    Success = false,
                    StatusCode = HttpStatusCode.InternalServerError,
                    ErrorMassage = { ex.Message }
                };
                return Content(JsonConvert.SerializeObject(errorResponse), "application/json");
            }
        }

        [HttpPost]
        public async Task<IActionResult> InactiveCourseAccountant(long id)
        {
            try
            {
                if (id <= 0)
                {
                    var invalidResponse = new APIResponse
                    {
                        Success = false,
                        StatusCode = HttpStatusCode.BadRequest,
                        ErrorMassage = { "Invalid accountant ID." }
                    };
                    return Content(JsonConvert.SerializeObject(invalidResponse), "application/json");
                }

                APIResponse response = await _unitOfWork.SettingsManagement.InactiveCourseAccountant<APIResponse>(id);
                return Content(JsonConvert.SerializeObject(response), "application/json");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inactivating course accountant {Id}", id);
                var errorResponse = new APIResponse
                {
                    Success = false,
                    StatusCode = HttpStatusCode.InternalServerError,
                    ErrorMassage = { ex.Message }
                };
                return Content(JsonConvert.SerializeObject(errorResponse), "application/json");
            }
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteCourseAccountant(long id)
        {
            try
            {
                if (id <= 0)
                {
                    var invalidResponse = new APIResponse
                    {
                        Success = false,
                        StatusCode = HttpStatusCode.BadRequest,
                        ErrorMassage = { "Invalid accountant ID." }
                    };
                    return Content(JsonConvert.SerializeObject(invalidResponse), "application/json");
                }

                APIResponse response = await _unitOfWork.SettingsManagement.DeleteCourseAccountant<APIResponse>(id);
                return Content(JsonConvert.SerializeObject(response), "application/json");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting course accountant {Id}", id);
                var errorResponse = new APIResponse
                {
                    Success = false,
                    StatusCode = HttpStatusCode.InternalServerError,
                    ErrorMassage = { ex.Message }
                };
                return Content(JsonConvert.SerializeObject(errorResponse), "application/json");
            }
        }

        [HttpPut]
        public async Task<IActionResult> UpdateCourseAccountantStatus(long id, bool isActive)
        {
            try
            {
                if (id <= 0)
                {
                    var invalidResponse = new APIResponse
                    {
                        Success = false,
                        StatusCode = HttpStatusCode.BadRequest,
                        ErrorMassage = { "Invalid accountant ID." }
                    };
                    return Content(JsonConvert.SerializeObject(invalidResponse), "application/json");
                }

                APIResponse response = await _unitOfWork.SettingsManagement.UpdateCourseAccountantStatus<APIResponse>(id, isActive);
                return Content(JsonConvert.SerializeObject(response), "application/json");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating status for course accountant {Id}", id);
                var errorResponse = new APIResponse
                {
                    Success = false,
                    StatusCode = HttpStatusCode.InternalServerError,
                    ErrorMassage = { ex.Message }
                };
                return Content(JsonConvert.SerializeObject(errorResponse), "application/json");
            }
        }

        // ==========================================
        // COURSE EXPENSE CATEGORY AJAX API PROXIES
        // ==========================================

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAllCourseExpenseCategories(bool? isActive = null)
        {
            try
            {
                APIResponse response = await _unitOfWork.SettingsManagement.GetAllCourseExpenseCategory<APIResponse>(isActive);
                return Content(JsonConvert.SerializeObject(response), "application/json");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all course expense categories");
                var errorResponse = new APIResponse
                {
                    Success = false,
                    StatusCode = HttpStatusCode.InternalServerError,
                    ErrorMassage = { ex.Message }
                };
                return Content(JsonConvert.SerializeObject(errorResponse), "application/json");
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetCourseExpenseCategoryById(long id)
        {
            try
            {
                if (id <= 0)
                {
                    var invalidResponse = new APIResponse
                    {
                        Success = false,
                        StatusCode = HttpStatusCode.BadRequest,
                        ErrorMassage = { "Invalid category ID." }
                    };
                    return Content(JsonConvert.SerializeObject(invalidResponse), "application/json");
                }

                APIResponse response = await _unitOfWork.SettingsManagement.GetCourseExpenseCategoryById<APIResponse>(id);
                return Content(JsonConvert.SerializeObject(response), "application/json");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting course expense category by id {Id}", id);
                var errorResponse = new APIResponse
                {
                    Success = false,
                    StatusCode = HttpStatusCode.InternalServerError,
                    ErrorMassage = { ex.Message }
                };
                return Content(JsonConvert.SerializeObject(errorResponse), "application/json");
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateCourseExpenseCategory([FromBody] CreateCourseExpenseCategoryDto dto)
        {
            try
            {
                if (dto == null || string.IsNullOrWhiteSpace(dto.Name))
                {
                    var invalidResponse = new APIResponse
                    {
                        Success = false,
                        StatusCode = HttpStatusCode.BadRequest,
                        ErrorMassage = { "Expense category name is required." }
                    };
                    return Content(JsonConvert.SerializeObject(invalidResponse), "application/json");
                }

                dto.Name = dto.Name.Trim();
                APIResponse response = await _unitOfWork.SettingsManagement.CreateCourseExpenseCategory<APIResponse>(dto);
                return Content(JsonConvert.SerializeObject(response), "application/json");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating course expense category");
                var errorResponse = new APIResponse
                {
                    Success = false,
                    StatusCode = HttpStatusCode.InternalServerError,
                    ErrorMassage = { ex.Message }
                };
                return Content(JsonConvert.SerializeObject(errorResponse), "application/json");
            }
        }

        [HttpPut]
        public async Task<IActionResult> UpdateCourseExpenseCategory([FromBody] UpdateCourseExpenseCategoryDto dto)
        {
            try
            {
                if (dto == null || dto.CourseExpenseCategoryId <= 0 || string.IsNullOrWhiteSpace(dto.Name))
                {
                    var invalidResponse = new APIResponse
                    {
                        Success = false,
                        StatusCode = HttpStatusCode.BadRequest,
                        ErrorMassage = { "Valid category ID and name are required." }
                    };
                    return Content(JsonConvert.SerializeObject(invalidResponse), "application/json");
                }

                dto.Name = dto.Name.Trim();
                APIResponse response = await _unitOfWork.SettingsManagement.UpdateCourseExpenseCategory<APIResponse>(dto);
                return Content(JsonConvert.SerializeObject(response), "application/json");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating course expense category {Id}", dto?.CourseExpenseCategoryId);
                var errorResponse = new APIResponse
                {
                    Success = false,
                    StatusCode = HttpStatusCode.InternalServerError,
                    ErrorMassage = { ex.Message }
                };
                return Content(JsonConvert.SerializeObject(errorResponse), "application/json");
            }
        }

        [HttpPost]
        public async Task<IActionResult> InactiveCourseExpenseCategory(long id)
        {
            try
            {
                if (id <= 0)
                {
                    var invalidResponse = new APIResponse
                    {
                        Success = false,
                        StatusCode = HttpStatusCode.BadRequest,
                        ErrorMassage = { "Invalid category ID." }
                    };
                    return Content(JsonConvert.SerializeObject(invalidResponse), "application/json");
                }

                APIResponse response = await _unitOfWork.SettingsManagement.InactiveCourseExpenseCategory<APIResponse>(id);
                return Content(JsonConvert.SerializeObject(response), "application/json");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inactivating course expense category {Id}", id);
                var errorResponse = new APIResponse
                {
                    Success = false,
                    StatusCode = HttpStatusCode.InternalServerError,
                    ErrorMassage = { ex.Message }
                };
                return Content(JsonConvert.SerializeObject(errorResponse), "application/json");
            }
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteCourseExpenseCategory(long id)
        {
            try
            {
                if (id <= 0)
                {
                    var invalidResponse = new APIResponse
                    {
                        Success = false,
                        StatusCode = HttpStatusCode.BadRequest,
                        ErrorMassage = { "Invalid category ID." }
                    };
                    return Content(JsonConvert.SerializeObject(invalidResponse), "application/json");
                }

                APIResponse response = await _unitOfWork.SettingsManagement.DeleteCourseExpenseCategory<APIResponse>(id);
                return Content(JsonConvert.SerializeObject(response), "application/json");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting course expense category {Id}", id);
                var errorResponse = new APIResponse
                {
                    Success = false,
                    StatusCode = HttpStatusCode.InternalServerError,
                    ErrorMassage = { ex.Message }
                };
                return Content(JsonConvert.SerializeObject(errorResponse), "application/json");
            }
        }

        [HttpPut]
        public async Task<IActionResult> UpdateCourseExpenseCategoryStatus(long id, bool isActive)
        {
            try
            {
                if (id <= 0)
                {
                    var invalidResponse = new APIResponse
                    {
                        Success = false,
                        StatusCode = HttpStatusCode.BadRequest,
                        ErrorMassage = { "Invalid category ID." }
                    };
                    return Content(JsonConvert.SerializeObject(invalidResponse), "application/json");
                }

                APIResponse response = await _unitOfWork.SettingsManagement.UpdateCourseExpenseCategoryStatus<APIResponse>(id, isActive);
                return Content(JsonConvert.SerializeObject(response), "application/json");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating status for course expense category {Id}", id);
                var errorResponse = new APIResponse
                {
                    Success = false,
                    StatusCode = HttpStatusCode.InternalServerError,
                    ErrorMassage = { ex.Message }
                };
                return Content(JsonConvert.SerializeObject(errorResponse), "application/json");
            }
        }
    }
}

