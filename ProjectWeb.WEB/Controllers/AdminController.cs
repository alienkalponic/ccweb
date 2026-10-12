using AutoMapper;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using ProjectWeb.Application.Common.Repository.Master;
using ProjectWeb.Domain.DTO.AboutPage;
using ProjectWeb.Domain.DTO.AchievementDetails;
using ProjectWeb.Domain.DTO.ActivityDetails;
using ProjectWeb.Domain.DTO.Banner;
using ProjectWeb.Domain.DTO.Category;
using ProjectWeb.Domain.DTO.ClubDescription;
using ProjectWeb.Domain.DTO.Gallery;
using ProjectWeb.Domain.DTO.LoginDto;
using ProjectWeb.Domain.Model;
using ProjectWeb.Domain.Utility;
using ProjectWeb.WEB.Helpers;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace ProjectWeb.WEB.Controllers
{
    public class AdminController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private IHttpContextAccessor _httpContextAccessor;
        private readonly ITokenProvider _tokenProvider;
        private readonly ILogger<AdminController> _logger;

        public AdminController(
            IMapper mapper,
            IUnitOfWork unitOfWork,
            IHttpContextAccessor httpContextAccessor,
            ITokenProvider tokenProvider,
            ILogger<AdminController> logger)
        {
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _httpContextAccessor = httpContextAccessor;
            _tokenProvider = tokenProvider;
            _logger = logger;
        }
        public IActionResult Index()
        {
            return View();
        }

        public async Task<IActionResult> AdminLogin()
        {
            var userId = Convert.ToInt64(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value);

            if (userId > 0)
            {
                _tokenProvider.ClearToken();
                var response = await _unitOfWork.User.GenerateNewTokenAsync<APIResponse>(userId);
                LoginResponseDTO model = JsonConvert.DeserializeObject<LoginResponseDTO>(Convert.ToString(response.Response));

                await GenerateMainToken(model);

                _tokenProvider.SetToken(model.AccessToken);
                if (model.AccessToken != null)
                {
                    return Redirect("~/Dashboard/Dashboard"); ;
                }
            }
            return View();
        }

        private async Task GenerateMainToken(LoginResponseDTO model)
        {
            var handler = new JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(model.AccessToken);

            var identity = new ClaimsIdentity(CookieAuthenticationDefaults.AuthenticationScheme);
            identity.AddClaim(new Claim(ClaimTypes.Name, jwt.Claims.FirstOrDefault(u => u.Type == "unique_name").Value));
            identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, jwt.Claims.FirstOrDefault(u => u.Type == "nameid").Value));
            identity.AddClaim(new Claim(ClaimTypes.Role, jwt.Claims.FirstOrDefault(u => u.Type == "role").Value));
            identity.AddClaim(new Claim(ClaimTypes.Email, jwt.Claims.FirstOrDefault(u => u.Type == "email").Value));
            var principal = new ClaimsPrincipal(identity);

            var authProperties = new AuthenticationProperties
            {
                IsPersistent = true,

                ExpiresUtc = DateTimeOffset.UtcNow.AddDays(6)
            };
            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal, authProperties);

        }

        [HttpPost]
        public async Task<string> Login(LoginRequestDTO obj)
        {

            //await HttpContext.SignOutAsync();
            _tokenProvider.ClearToken();

            APIResponse response = await _unitOfWork.User.LoginAsync<APIResponse>(obj);
            string data = string.Empty;
            if (response != null && response.Success)
            {
                LoginResponseDTO model = JsonConvert.DeserializeObject<LoginResponseDTO>(Convert.ToString(response.Response));
                if (model.UserDetails != null)
                {
                    await GenerateMainToken(model);
                    _tokenProvider.SetToken(model.AccessToken);
                }
                else
                {
                    HttpContext.Session.SetString("userEmail", model.UserDetails.EmailAddress);
                }
                data = JsonConvert.SerializeObject(response);
            }
            else
            {
                data = JsonConvert.SerializeObject(response);
            }
            return data;
        }

        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync();


            HttpContext.Session.Clear();
            return RedirectToAction("AdminLogin");
        }

        public IActionResult AccessDenied()
        {

            return View();
        }

        #region::Banner
        public async Task<IActionResult> BannerContent()
        {
            return View();
        }
        [Authorize(Roles = "2")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        [RequestSizeLimit(2147483647)]       //unit is bytes => 2GB
        [RequestFormLimits(MultipartBodyLengthLimit = 2147483647)]
        public async Task<IActionResult> CreateBanner(MultipleModel mmm)
        {
            APIResponse response = await _unitOfWork
                .ContentManagement
                .BannerCreate<APIResponse>(mmm.BannerCreateDto);

            // Use explicit serialization to ensure casing matches exactly what we expect
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "2")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        [RequestSizeLimit(2147483647)]
        [RequestFormLimits(MultipartBodyLengthLimit = 2147483647)]
        public async Task<IActionResult> UpdateBanner(MultipleModel mmm)
        {
            APIResponse response = await _unitOfWork
                .ContentManagement
                .BannerUpdate<APIResponse>(mmm.BannerUpdateDto!);

            return Content(JsonConvert.SerializeObject(response), "application/json");
        }


        [Authorize(Roles = "2")]
        [HttpGet]
        public async Task<IActionResult> GetBannerList(int pageNumber = 1, int pageSize = 10, string search = "")
        {
            MultipleModel mmm = new MultipleModel();
            APIResponse response = await _unitOfWork
                .ContentManagement
                .BannerGetAll<APIResponse>(pageSize.ToString(), pageNumber.ToString(), search ?? "");

            mmm.BannerDtos = JsonConvert.DeserializeObject<List<BannerDto>>(Convert.ToString(response.Response)!);
            return Content(JsonConvert.SerializeObject(new { data = mmm.BannerDtos ?? new List<BannerDto>(), totalRecords = response.TotalItem }), "application/json");
        }

        [Authorize(Roles = "2")]
        [HttpGet]
        public async Task<IActionResult> GetBannerById(int id)
        {
            MultipleModel mmm = new MultipleModel();
            APIResponse response = await _unitOfWork
                .ContentManagement
                .BannerGet<APIResponse>(id);

            mmm.BannerDto = JsonConvert.DeserializeObject<List<BannerDto>>(Convert.ToString(response.Response)!)!.FirstOrDefault();
            return Content(JsonConvert.SerializeObject(mmm.BannerDto), "application/json");
        }

        [Authorize(Roles = "2")]
        [HttpGet]
        public async Task<IActionResult> DeleteBannerById(int id)
        {
            if (id <= 0)
                return Content(JsonConvert.SerializeObject(new APIResponse { Success = false, Response = "Invalid Banner ID." }), "application/json");

            APIResponse response = await _unitOfWork
                .ContentManagement
                .BannerDelete<APIResponse>(id);

            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        #endregion

        #region::ClubDescription
        public async Task<IActionResult> ClubDescription()
        {
            return View();
        }

        [Authorize(Roles = "2")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        [RequestSizeLimit(long.MaxValue)]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        public async Task<IActionResult> CreateClubDescription(MultipleModel mmm)
        {
            _logger.LogInformation("[CreateClubDescription] Action hit. DTO null={IsNull}",
                mmm.CreateClubDescriptionDto == null);
            _logger.LogInformation("[CreateClubDescription] Files={Count}",
                mmm.CreateClubDescriptionDto?.Files?.Count ?? 0);

            APIResponse response = await _unitOfWork
                .ContentManagement
                .DescriptionCreate<APIResponse>(mmm.CreateClubDescriptionDto!);

            _logger.LogInformation("[CreateClubDescription] Response Success={S} Status={Code}",
                response?.Success, response?.StatusCode);

            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "2")]
        [HttpGet]
        public async Task<IActionResult> GetDescriptionList(int pageNumber = 1, int pageSize = 10, string search = "")
        {
            MultipleModel mmm = new MultipleModel();
            APIResponse response = await _unitOfWork
                .ContentManagement
                .DescriptionGetAll<APIResponse>(pageSize.ToString(), pageNumber.ToString(), search ?? "");

            mmm.ClubDescriptionDtos = JsonConvert.DeserializeObject<List<GetClubDescriptionDto>>(Convert.ToString(response.Response)!);
            return Content(JsonConvert.SerializeObject(new { data = mmm.ClubDescriptionDtos ?? new List<GetClubDescriptionDto>(), totalRecords = response.TotalItem }), "application/json");
        }

        [Authorize(Roles = "2")]
        [HttpGet]
        public async Task<IActionResult> GetDescriptionById(int id)
        {
            MultipleModel mmm = new MultipleModel();
            APIResponse response = await _unitOfWork
                .ContentManagement
                .DescriptionGet<APIResponse>(id);

            mmm.ClubDescriptionDto = JsonConvert.DeserializeObject<List<GetClubDescriptionDto>>(Convert.ToString(response.Response)!)!.FirstOrDefault();
            return Content(JsonConvert.SerializeObject(mmm.ClubDescriptionDto), "application/json");
        }

        [Authorize(Roles = "2")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        [RequestSizeLimit(long.MaxValue)]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        public async Task<IActionResult> UpdateClubDescription(MultipleModel mmm)
        {
            _logger.LogInformation("[UpdateClubDescription] Action hit. DTO null={IsNull}",
                mmm.UpdateClubDescriptionDto == null);
            _logger.LogInformation("[UpdateClubDescription] NewImages={Imgs} DeletedIds={Ids}",
                mmm.UpdateClubDescriptionDto?.NewImages?.Count ?? 0,
                string.Join(",", mmm.UpdateClubDescriptionDto?.DeletedImageIds ?? new List<long>()));

            APIResponse response = await _unitOfWork
                .ContentManagement
                .DescriptionUpdate<APIResponse>(mmm.UpdateClubDescriptionDto!);

            _logger.LogInformation("[UpdateClubDescription] Response Success={S} Status={Code}",
                response?.Success, response?.StatusCode);

            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "2")]
        [HttpGet]
        public async Task<IActionResult> DeleteDescriptionById(int id)
        {
            if (id <= 0)
                return Content(JsonConvert.SerializeObject(new APIResponse { Success = false, Response = "Invalid Description ID." }), "application/json");

            APIResponse response = await _unitOfWork
                .ContentManagement
                .DescriptionDelete<APIResponse>(id);

            return Content(JsonConvert.SerializeObject(response), "application/json");
        }


        #endregion

        #region::ClubActivities

        public async Task<IActionResult> ClubActivities()
        {
            return View();
        }

        [Authorize(Roles = "2")]
        [HttpGet]
        public async Task<IActionResult> GetAllActivities(int pageNumber = 1, int pageSize = 10, string search = "")
        {
            MultipleModel mmm = new MultipleModel();
            APIResponse response = await _unitOfWork
                .ContentManagement
                .ActivityGetAll<APIResponse>(pageSize.ToString(), pageNumber.ToString(), search ?? "");

            var stringResponse = Convert.ToString(response.Response);
            if (!string.IsNullOrEmpty(stringResponse))
            {
                mmm.ClubActivityDtos = Newtonsoft.Json.JsonConvert.DeserializeObject<List<ProjectWeb.Domain.DTO.ClubActivity.GetClubActivityDto>>(stringResponse);
            }
            return Content(Newtonsoft.Json.JsonConvert.SerializeObject(new { data = mmm.ClubActivityDtos ?? new List<ProjectWeb.Domain.DTO.ClubActivity.GetClubActivityDto>(), totalRecords = response.TotalItem }), "application/json");
        }

        [Authorize(Roles = "2")]
        [HttpGet]
        public async Task<IActionResult> GetActivityById(int id)
        {
            MultipleModel mmm = new MultipleModel();
            APIResponse response = await _unitOfWork
                .ContentManagement
                .ActivityGet<APIResponse>(id);

            var stringResponse = Convert.ToString(response.Response);
            if (!string.IsNullOrEmpty(stringResponse))
            {
                mmm.ClubActivityDto = Newtonsoft.Json.JsonConvert.DeserializeObject<List<ProjectWeb.Domain.DTO.ClubActivity.GetClubActivityDto>>(stringResponse)?.FirstOrDefault();
            }
            return Content(Newtonsoft.Json.JsonConvert.SerializeObject(mmm.ClubActivityDto), "application/json");
        }

        [Authorize(Roles = "2")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        [RequestSizeLimit(long.MaxValue)]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        public async Task<IActionResult> CreateActivity(MultipleModel mmm)
        {
            APIResponse response = await _unitOfWork
                .ContentManagement
                .ActivityCreate<APIResponse>(mmm.CreateClubActivityDto!);

            return Content(Newtonsoft.Json.JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "2")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        [RequestSizeLimit(long.MaxValue)]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        public async Task<IActionResult> UpdateActivity(MultipleModel mmm)
        {
            APIResponse response = await _unitOfWork
                .ContentManagement
                .ActivityUpdate<APIResponse>(mmm.UpdateClubActivityDto!);

            return Content(Newtonsoft.Json.JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "2")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteActivity(int id)
        {
            if (id <= 0)
                return Content(Newtonsoft.Json.JsonConvert.SerializeObject(new APIResponse { Success = false, Response = "Invalid Activity ID." }), "application/json");

            APIResponse response = await _unitOfWork
                .ContentManagement
                .ActivityDelete<APIResponse>(id);

            return Content(Newtonsoft.Json.JsonConvert.SerializeObject(response), "application/json");
        }

        #endregion

        #region::Achievement List

        public async Task<IActionResult> AchievementList()
        {
            MultipleModel mmm = new MultipleModel();
            APIResponse categoryresponse = await _unitOfWork
                .SettingsManagement
                .GetAllCategory<APIResponse>();
            mmm.CategoryDtos = JsonConvert.DeserializeObject<List<CategoryDto>>(Convert.ToString(categoryresponse.Response)!);
            return View(mmm);
        }

        //public IActionResult GalleryContent()
        //{
        //    return View();
        //}

        [Authorize(Roles = "2")]
        [HttpGet]
        public async Task<IActionResult> GetGalleryList(int pageNumber = 1, int pageSize = 12, string search = "")
        {
            MultipleModel mmm = new MultipleModel();
            APIResponse response = await _unitOfWork
                .ContentManagement
                .GalleryGetAll<APIResponse>(pageSize.ToString(), pageNumber.ToString(), search ?? "");

            var stringResponse = Convert.ToString(response.Response);
            if (!string.IsNullOrEmpty(stringResponse))
            {
                mmm.GalleryDtos = JsonConvert.DeserializeObject<List<GalleryDto>>(stringResponse);
            }
            return Content(JsonConvert.SerializeObject(new { data = mmm.GalleryDtos ?? new List<GalleryDto>(), totalRecords = response.TotalItem }), "application/json");
        }

        [Authorize(Roles = "2")]
        [HttpGet]
        public async Task<IActionResult> GetGalleryById(int id)
        {
            MultipleModel mmm = new MultipleModel();
            APIResponse response = await _unitOfWork
                .ContentManagement
                .GalleryGet<APIResponse>(id);

            var stringResponse = Convert.ToString(response.Response);
            if (!string.IsNullOrEmpty(stringResponse))
            {
                mmm.GalleryDto = JsonConvert.DeserializeObject<List<GalleryDto>>(stringResponse)?.FirstOrDefault();
            }
            return Content(JsonConvert.SerializeObject(mmm.GalleryDto), "application/json");
        }

        [Authorize(Roles = "2")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        [RequestSizeLimit(long.MaxValue)]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        public async Task<IActionResult> CreateGallery(MultipleModel mmm)
        {
            if (mmm.CreateGalleryDto?.File != null)
            {
                var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "gallery");
                FileUploadHelper.UploadFile(mmm.CreateGalleryDto.File, folderPath);
            }

            APIResponse response = await _unitOfWork
                .ContentManagement
                .GalleryCreate<APIResponse>(mmm.CreateGalleryDto!);

            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "2")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        [RequestSizeLimit(long.MaxValue)]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        public async Task<IActionResult> UpdateGallery(MultipleModel mmm)
        {
            if (mmm.UpdateGalleryDto?.File != null)
            {
                var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "gallery");
                FileUploadHelper.UploadFile(mmm.UpdateGalleryDto.File, folderPath);
            }

            APIResponse response = await _unitOfWork
                .ContentManagement
                .GalleryUpdate<APIResponse>(mmm.UpdateGalleryDto!);

            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "2")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteGallery(int id)
        {
            if (id <= 0)
                return Content(JsonConvert.SerializeObject(new APIResponse { Success = false, Response = "Invalid Gallery ID." }), "application/json");

            APIResponse response = await _unitOfWork
                .ContentManagement
                .GalleryDelete<APIResponse>(id);

            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        #endregion

        #region::Activity Details

        [Authorize(Roles = "2")]
        [HttpGet]
        public async Task<IActionResult> ActivityDetails()
        {
            int pageNumber = 1; int pageSize = 100; string search = "";
            MultipleModel model = new MultipleModel();
            APIResponse response = await _unitOfWork
                .ContentManagement
                .ActivityGetAll<APIResponse>(pageSize.ToString(), pageNumber.ToString(), search ?? "");

            var stringResponse = Convert.ToString(response.Response);
            if (!string.IsNullOrEmpty(stringResponse))
            {
                model.ClubActivityDtos = Newtonsoft.Json.JsonConvert.DeserializeObject<List<ProjectWeb.Domain.DTO.ClubActivity.GetClubActivityDto>>(stringResponse);
            }

            return View(model);
        }

        [Authorize(Roles = "2")]
        [HttpGet]
        public async Task<IActionResult> GetActivityDetailsList(int pageNumber = 1, int pageSize = 10, string search = "")
        {
            MultipleModel mmm = new MultipleModel();
            APIResponse response = await _unitOfWork
                .ContentManagement
                .ActivityDetailsGetAll<APIResponse>(pageSize.ToString(), pageNumber.ToString(), search ?? "");

            mmm.ActivityDetailsDtos = JsonConvert.DeserializeObject<List<ActivityDetailsDto>>(Convert.ToString(response.Response)!);
            return Content(JsonConvert.SerializeObject(new { data = mmm.ActivityDetailsDtos ?? new List<ActivityDetailsDto>(), totalRecords = response.TotalItem }), "application/json");
        }

        [Authorize(Roles = "2")]
        [HttpGet]
        public async Task<IActionResult> GetActivityDetailsById(int id)
        {
            MultipleModel mmm = new MultipleModel();
            APIResponse response = await _unitOfWork
                .ContentManagement
                .ActivityDetailsGet<APIResponse>(id);

            mmm.ActivityDetailsDto = JsonConvert.DeserializeObject<List<ActivityDetailsDto>>(Convert.ToString(response.Response)!)!.FirstOrDefault();
            return Content(JsonConvert.SerializeObject(mmm.ActivityDetailsDto), "application/json");
        }

        [Authorize(Roles = "2")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        [RequestSizeLimit(long.MaxValue)]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        public async Task<IActionResult> CreateActivityDetails(MultipleModel mmm)
        {
            _logger.LogInformation("[CreateActivityDetails] Action hit. DTO null={IsNull}",
                mmm.CreateActivityDetailsDto == null);
            _logger.LogInformation("[CreateActivityDetails] Files={Count}",
                mmm.CreateActivityDetailsDto?.Images?.Count ?? 0);

            APIResponse response = await _unitOfWork
                .ContentManagement
                .ActivityDetailsCreate<APIResponse>(mmm.CreateActivityDetailsDto!);

            _logger.LogInformation("[CreateActivityDetails] Response Success={S} Status={Code}",
                response?.Success, response?.StatusCode);

            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "2")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        [RequestSizeLimit(long.MaxValue)]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        public async Task<IActionResult> UpdateActivityDetails(MultipleModel mmm)
        {
            _logger.LogInformation("[UpdateActivityDetails] Action hit. DTO null={IsNull}",
                mmm.UpdateActivityDetailsDto == null);
            _logger.LogInformation("[UpdateActivityDetails] NewImages={Imgs} DeletedIds={Ids}",
                mmm.UpdateActivityDetailsDto?.NewImages?.Count ?? 0,
                string.Join(",", mmm.UpdateActivityDetailsDto?.DeletedImageIds ?? new List<long>()));

            APIResponse response = await _unitOfWork
                .ContentManagement
                .ActivityDetailsUpdate<APIResponse>(mmm.UpdateActivityDetailsDto!);

            _logger.LogInformation("[UpdateActivityDetails] Response Success={S} Status={Code}",
                response?.Success, response?.StatusCode);

            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "2")]
        [HttpGet]
        public async Task<IActionResult> DeleteActivityDetailsById(int id)
        {
            if (id <= 0)
                return Content(JsonConvert.SerializeObject(new APIResponse { Success = false, Response = "Invalid Description ID." }), "application/json");

            APIResponse response = await _unitOfWork
                .ContentManagement
                .ActivityDetailsDelete<APIResponse>(id);

            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        #endregion

        #region::Achievement Details
        [Authorize(Roles = "2")]
        [HttpGet]
        public async Task<IActionResult> AchievementDetails()
        {
            MultipleModel mmm = new MultipleModel();
            APIResponse response = await _unitOfWork
                .ContentManagement
                .GalleryGetAll<APIResponse>("50", "1", "");

            var stringResponse = Convert.ToString(response.Response);
            if (!string.IsNullOrEmpty(stringResponse))
            {
                mmm.GalleryDtos = JsonConvert.DeserializeObject<List<GalleryDto>>(stringResponse);
            }
            return View(mmm);
        }

        [Authorize(Roles = "2")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        [RequestSizeLimit(long.MaxValue)]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        public async Task<IActionResult> CreateAchievementDetails(MultipleModel mmm)
        {
            _logger.LogInformation("[CreateAchievementDetails] Action hit. DTO null={IsNull}",
                mmm.AchievementDetailsCreateDto == null);


            APIResponse response = await _unitOfWork
                .ContentManagement
                .AchievementDetailsCreate<APIResponse>(mmm.AchievementDetailsCreateDto!);

            _logger.LogInformation("[CreateAchievementDetails] Response Success={S} Status={Code}",
                response?.Success, response?.StatusCode);

            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "2")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        [RequestSizeLimit(long.MaxValue)]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        public async Task<IActionResult> UpdateAchievementDetails(MultipleModel mmm)
        {
            _logger.LogInformation("[UpdateAchievementDetails] Action hit. DTO null={IsNull}",
                mmm.AchievementDetailsUpdateDto == null);

            APIResponse response = await _unitOfWork
                .ContentManagement
                .AchievementDetailsUpdate<APIResponse>(mmm.AchievementDetailsUpdateDto!);

            _logger.LogInformation("[UpdateAchievementDetails] Response Success={S} Status={Code}",
                response?.Success, response?.StatusCode);

            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "2")]
        [HttpGet]
        public async Task<IActionResult> GetAchievementDetailsList(int pageNumber = 1, int pageSize = 10, string search = "")
        {
            MultipleModel mmm = new MultipleModel();
            APIResponse response = await _unitOfWork
                .ContentManagement
                .AchievementDetailsGetAll<APIResponse>(pageSize.ToString(), pageNumber.ToString(), search ?? "");

            mmm.AchievementDetailsDtos = JsonConvert.DeserializeObject<List<AchievementDetailsDto>>(Convert.ToString(response.Response)!);
            return Content(JsonConvert.SerializeObject(new { data = mmm.AchievementDetailsDtos ?? new List<AchievementDetailsDto>(), totalRecords = response.TotalItem }), "application/json");
        }

        [Authorize(Roles = "2")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteAchievementDetails(long id)
        {
            if (id <= 0)
                return Content(JsonConvert.SerializeObject(new APIResponse { Success = false, Response = "Invalid Achievement ID." }), "application/json");

            APIResponse response = await _unitOfWork
                .ContentManagement
                .AchievementDetailsDelete<APIResponse>(id);

            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "2")]
        [HttpGet]
        public async Task<IActionResult> GetAchievementDetailsById(long id)
        {
            if (id <= 0)
                return Content(JsonConvert.SerializeObject(new APIResponse { Success = false, Response = "Invalid Achievement ID." }), "application/json");

            APIResponse response = await _unitOfWork
                .ContentManagement
                .AchievementDetailsGet<APIResponse>(id);

            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "2")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        [RequestSizeLimit(long.MaxValue)]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        public async Task<IActionResult> CreateAchievementDetailsGallery(MultipleModel mmm)
        {
            _logger.LogInformation("[CreateAchievementDetailsGallery] Action hit. DTO null={IsNull}",
                mmm.achievementDetailsGalleryCreateDto == null);

            APIResponse response = await _unitOfWork
                .ContentManagement
                .AchievementDetailsGalleryCreate<APIResponse>(mmm.achievementDetailsGalleryCreateDto!);

            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "2")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        [RequestSizeLimit(long.MaxValue)]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        public async Task<IActionResult> UpdateAchievementDetailsGallery(MultipleModel mmm)
        {
            _logger.LogInformation("[UpdateAchievementDetailsGallery] Action hit. DTO null={IsNull}",
                mmm.achievementDetailsGalleryUpdateDto == null);

            APIResponse response = await _unitOfWork
                .ContentManagement
                .AchievementDetailsGalleryUpdate<APIResponse>(mmm.achievementDetailsGalleryUpdateDto!);

            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "2")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteAchievementDetailsGallery(long id)
        {
            if (id <= 0)
                return Content(JsonConvert.SerializeObject(new APIResponse { Success = false, Response = "Invalid Gallery ID." }), "application/json");

            APIResponse response = await _unitOfWork
                .ContentManagement
                .AchievementDetailsGalleryDelete<APIResponse>(id);

            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "2")]
        [HttpGet]
        public async Task<IActionResult> GetAchievementDetailsGalleryList(long id)
        {
            if (id <= 0)
                return Content(JsonConvert.SerializeObject(new List<object>()), "application/json");

            APIResponse response = await _unitOfWork
                .ContentManagement
                .AchievementDetailsGalleryGetByAchievementId<APIResponse>(id);

            var stringResponse = Convert.ToString(response.Response);
            List<AchievementDetailsGalleryUpdateDto> list = new List<AchievementDetailsGalleryUpdateDto>();
            if (!string.IsNullOrEmpty(stringResponse))
            {
                list = JsonConvert.DeserializeObject<List<AchievementDetailsGalleryUpdateDto>>(stringResponse) ?? new List<AchievementDetailsGalleryUpdateDto>();
            }
            return Content(JsonConvert.SerializeObject(list), "application/json");
        }
        #endregion

        #region::AboutUs

        [Authorize(Roles = "2")]
        [HttpGet]
        public async Task<IActionResult> AboutUs()
        {
            MultipleModel mmm = new MultipleModel();
            return View(mmm);
        }

        [Authorize(Roles = "2")]
        [HttpGet]
        public async Task<IActionResult> GetAllAboutPages(int pageNumber = 1, int pageSize = 10, string search = "")
        {
            APIResponse response = await _unitOfWork
                .ContentManagement
                .AboutPageGetAll<APIResponse>(pageSize.ToString(), pageNumber.ToString(), search ?? "");

            var stringResponse = Convert.ToString(response.Response);
            List<AboutPageDto> list = new List<AboutPageDto>();
            if (!string.IsNullOrEmpty(stringResponse))
            {
                try
                {
                    list = JsonConvert.DeserializeObject<List<AboutPageDto>>(stringResponse) ?? new List<AboutPageDto>();
                }
                catch
                {
                    var single = JsonConvert.DeserializeObject<AboutPageDto>(stringResponse);
                    if (single != null) list.Add(single);
                }
            }
            return Content(JsonConvert.SerializeObject(new { data = list, totalRecords = response.TotalItem }), "application/json");
        }

        [Authorize(Roles = "2")]
        [HttpGet]
        public async Task<IActionResult> GetAboutPageById(long id)
        {
            if (id <= 0)
                return Content(JsonConvert.SerializeObject(new APIResponse { Success = false, Response = "Invalid About Page ID." }), "application/json");

            APIResponse response = await _unitOfWork
                .ContentManagement
                .AboutPageGet<APIResponse>(id);

            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "2")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        [RequestSizeLimit(long.MaxValue)]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        public async Task<IActionResult> CreateAboutPage(MultipleModel mmm)
        {
            _logger.LogInformation("[CreateAboutPage] Action hit. CreateAboutPageDto null={IsNull}", mmm.CreateAboutPageDto == null);

            var dto = mmm.CreateAboutPageDto ?? new CreateAboutPageDto();
            dto.AboutPage ??= new AboutPageDto();

            if (Request.HasFormContentType)
            {
                var form = Request.Form;
                if (string.IsNullOrEmpty(dto.AboutPage.PageTitle))
                {
                    dto.AboutPage.PageTitle = form["CreateAboutPageDto.AboutPage.PageTitle"].FirstOrDefault() ?? form["PageTitle"].FirstOrDefault() ?? form["CreateAboutPageDto.PageTitle"].FirstOrDefault() ?? form["AboutPage.PageTitle"].FirstOrDefault();
                    dto.AboutPage.PageSlug = form["CreateAboutPageDto.AboutPage.PageSlug"].FirstOrDefault() ?? form["PageSlug"].FirstOrDefault() ?? form["CreateAboutPageDto.PageSlug"].FirstOrDefault() ?? form["AboutPage.PageSlug"].FirstOrDefault();
                    dto.AboutPage.HeroTitle = form["CreateAboutPageDto.AboutPage.HeroTitle"].FirstOrDefault() ?? form["HeroTitle"].FirstOrDefault() ?? form["CreateAboutPageDto.HeroTitle"].FirstOrDefault();
                    dto.AboutPage.HeroSubtitle = form["CreateAboutPageDto.AboutPage.HeroSubtitle"].FirstOrDefault() ?? form["HeroSubtitle"].FirstOrDefault() ?? form["CreateAboutPageDto.HeroSubtitle"].FirstOrDefault();
                    dto.AboutPage.HistoryTitle = form["CreateAboutPageDto.AboutPage.HistoryTitle"].FirstOrDefault() ?? form["HistoryTitle"].FirstOrDefault() ?? form["CreateAboutPageDto.HistoryTitle"].FirstOrDefault();
                    dto.AboutPage.HistoryDescription = form["CreateAboutPageDto.AboutPage.HistoryDescription"].FirstOrDefault() ?? form["HistoryDescription"].FirstOrDefault() ?? form["CreateAboutPageDto.HistoryDescription"].FirstOrDefault();
                    dto.AboutPage.MapTitle = form["CreateAboutPageDto.AboutPage.MapTitle"].FirstOrDefault() ?? form["MapTitle"].FirstOrDefault() ?? form["CreateAboutPageDto.MapTitle"].FirstOrDefault();
                    dto.AboutPage.MapAddress = form["CreateAboutPageDto.AboutPage.MapAddress"].FirstOrDefault() ?? form["MapAddress"].FirstOrDefault() ?? form["CreateAboutPageDto.MapAddress"].FirstOrDefault();
                }

                // Latitude
                var latStr = form["CreateAboutPageDto.AboutPage.Latitude"].FirstOrDefault() ?? form["Latitude"].FirstOrDefault() ?? form["CreateAboutPageDto.Latitude"].FirstOrDefault() ?? form["AboutPage.Latitude"].FirstOrDefault();
                if (!string.IsNullOrWhiteSpace(latStr))
                {
                    latStr = latStr.Trim().Replace(',', '.');
                    if (decimal.TryParse(latStr, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var lat))
                        dto.AboutPage.Latitude = lat;
                }

                // Longitude
                var lngStr = form["CreateAboutPageDto.AboutPage.Longitude"].FirstOrDefault() ?? form["Longitude"].FirstOrDefault() ?? form["CreateAboutPageDto.Longitude"].FirstOrDefault() ?? form["AboutPage.Longitude"].FirstOrDefault();
                if (!string.IsNullOrWhiteSpace(lngStr))
                {
                    lngStr = lngStr.Trim().Replace(',', '.');
                    if (decimal.TryParse(lngStr, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var lng))
                        dto.AboutPage.Longitude = lng;
                }

                // IsActive
                var activeStr = form["CreateAboutPageDto.AboutPage.IsActive"].FirstOrDefault() ?? form["CreateAboutPageDto.IsActive"].FirstOrDefault() ?? form["AboutPage.IsActive"].FirstOrDefault() ?? form["IsActive"].FirstOrDefault();
                if (!string.IsNullOrWhiteSpace(activeStr) && bool.TryParse(activeStr, out var isAct))
                {
                    dto.AboutPage.IsActive = isAct;
                }

                dto.BannerFile = Request.Form.Files["BannerFile"] ?? Request.Form.Files["CreateAboutPageDto.BannerFile"] ?? Request.Form.Files["AboutPage.BannerFile"];
            }

            APIResponse response = await _unitOfWork
                .ContentManagement
                .AboutPageCreate<APIResponse>(dto);

            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "2")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        [RequestSizeLimit(long.MaxValue)]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        public async Task<IActionResult> UpdateAboutPage(MultipleModel mmm)
        {
            _logger.LogInformation("[UpdateAboutPage] Action hit. UpdateAboutPageDto null={IsNull}", mmm.UpdateAboutPageDto == null);

            var dto = mmm.UpdateAboutPageDto ?? new UpdateAboutPageDto();
            dto.AboutPage ??= new AboutPageDto();

            if (Request.HasFormContentType)
            {
                var form = Request.Form;
                if (dto.AboutPageId <= 0)
                {
                    if (long.TryParse(form["AboutPageId"].FirstOrDefault() ?? form["UpdateAboutPageDto.AboutPageId"].FirstOrDefault() ?? form["UpdateAboutPageDto.AboutPage.AboutPageId"].FirstOrDefault(), out var id))
                    {
                        dto.AboutPageId = id;
                        dto.AboutPage.AboutPageId = id;
                    }
                }

                if (string.IsNullOrEmpty(dto.AboutPage.PageTitle))
                {
                    dto.AboutPage.PageTitle = form["UpdateAboutPageDto.AboutPage.PageTitle"].FirstOrDefault() ?? form["PageTitle"].FirstOrDefault() ?? form["UpdateAboutPageDto.PageTitle"].FirstOrDefault() ?? form["AboutPage.PageTitle"].FirstOrDefault();
                    dto.AboutPage.PageSlug = form["UpdateAboutPageDto.AboutPage.PageSlug"].FirstOrDefault() ?? form["PageSlug"].FirstOrDefault() ?? form["UpdateAboutPageDto.PageSlug"].FirstOrDefault() ?? form["AboutPage.PageSlug"].FirstOrDefault();
                    dto.AboutPage.HeroTitle = form["UpdateAboutPageDto.AboutPage.HeroTitle"].FirstOrDefault() ?? form["HeroTitle"].FirstOrDefault() ?? form["UpdateAboutPageDto.HeroTitle"].FirstOrDefault();
                    dto.AboutPage.HeroSubtitle = form["UpdateAboutPageDto.AboutPage.HeroSubtitle"].FirstOrDefault() ?? form["HeroSubtitle"].FirstOrDefault() ?? form["UpdateAboutPageDto.HeroSubtitle"].FirstOrDefault();
                    dto.AboutPage.HistoryTitle = form["UpdateAboutPageDto.AboutPage.HistoryTitle"].FirstOrDefault() ?? form["HistoryTitle"].FirstOrDefault() ?? form["UpdateAboutPageDto.HistoryTitle"].FirstOrDefault();
                    dto.AboutPage.HistoryDescription = form["UpdateAboutPageDto.AboutPage.HistoryDescription"].FirstOrDefault() ?? form["HistoryDescription"].FirstOrDefault() ?? form["UpdateAboutPageDto.HistoryDescription"].FirstOrDefault();
                    dto.AboutPage.MapTitle = form["UpdateAboutPageDto.AboutPage.MapTitle"].FirstOrDefault() ?? form["MapTitle"].FirstOrDefault() ?? form["UpdateAboutPageDto.MapTitle"].FirstOrDefault();
                    dto.AboutPage.MapAddress = form["UpdateAboutPageDto.AboutPage.MapAddress"].FirstOrDefault() ?? form["MapAddress"].FirstOrDefault() ?? form["UpdateAboutPageDto.MapAddress"].FirstOrDefault();
                }

                // Latitude
                var latStr = form["UpdateAboutPageDto.AboutPage.Latitude"].FirstOrDefault() ?? form["Latitude"].FirstOrDefault() ?? form["UpdateAboutPageDto.Latitude"].FirstOrDefault() ?? form["AboutPage.Latitude"].FirstOrDefault();
                if (!string.IsNullOrWhiteSpace(latStr))
                {
                    latStr = latStr.Trim().Replace(',', '.');
                    if (decimal.TryParse(latStr, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var lat))
                        dto.AboutPage.Latitude = lat;
                }

                // Longitude
                var lngStr = form["UpdateAboutPageDto.AboutPage.Longitude"].FirstOrDefault() ?? form["Longitude"].FirstOrDefault() ?? form["UpdateAboutPageDto.Longitude"].FirstOrDefault() ?? form["AboutPage.Longitude"].FirstOrDefault();
                if (!string.IsNullOrWhiteSpace(lngStr))
                {
                    lngStr = lngStr.Trim().Replace(',', '.');
                    if (decimal.TryParse(lngStr, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var lng))
                        dto.AboutPage.Longitude = lng;
                }

                // IsActive
                var activeStr = form["UpdateAboutPageDto.AboutPage.IsActive"].FirstOrDefault() ?? form["UpdateAboutPageDto.IsActive"].FirstOrDefault() ?? form["AboutPage.IsActive"].FirstOrDefault() ?? form["IsActive"].FirstOrDefault();
                if (!string.IsNullOrWhiteSpace(activeStr) && bool.TryParse(activeStr, out var isAct))
                {
                    dto.AboutPage.IsActive = isAct;
                }

                dto.BannerFile = Request.Form.Files["BannerFile"] ?? Request.Form.Files["UpdateAboutPageDto.BannerFile"] ?? Request.Form.Files["AboutPage.BannerFile"];
            }

            APIResponse response = await _unitOfWork
                .ContentManagement
                .AboutPageUpdate<APIResponse>(dto);

            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        [Authorize(Roles = "Developer,Administrator,2")]
        [HttpPost, HttpGet]
        public async Task<IActionResult> DeleteAboutPageById(long id)
        {
            _logger.LogInformation("[DeleteAboutPageById] Hit with id={Id}", id);

            if (id <= 0)
                return Content(JsonConvert.SerializeObject(new APIResponse { Success = false, Response = "Invalid About Page ID." }), "application/json");

            string? deletedBy = null;
            if (long.TryParse(User.Identity?.Name, out var numId))
            {
                deletedBy = numId.ToString();
            }

            APIResponse response = await _unitOfWork
                .ContentManagement
                .AboutPageDelete<APIResponse>(id, deletedBy);

            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        #endregion

    }
}
