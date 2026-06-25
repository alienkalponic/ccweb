using AutoMapper;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using ProjectWeb.Application.Common.Repository.Master;
using ProjectWeb.Domain.DTO.AchievementDetails;
using ProjectWeb.Domain.DTO.ActivityDetails;
using ProjectWeb.Domain.DTO.Banner;
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
                if(model.AccessToken!=null)
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
        public async Task<IActionResult> GetBannerList()
        {
            MultipleModel mmm=new MultipleModel();
            APIResponse response = await _unitOfWork
                .ContentManagement
                .BannerGetAll<APIResponse>("10","1","");

            mmm.BannerDtos = JsonConvert.DeserializeObject<List<BannerDto>>(Convert.ToString(response.Response)!);
            return Content(JsonConvert.SerializeObject(mmm.BannerDtos), "application/json");
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
        public async Task<IActionResult> GetDescriptionList()
        {
            MultipleModel mmm = new MultipleModel();
            APIResponse response = await _unitOfWork
                .ContentManagement
                .DescriptionGetAll<APIResponse>("10", "1", "");

            mmm.ClubDescriptionDtos = JsonConvert.DeserializeObject<List<GetClubDescriptionDto>>(Convert.ToString(response.Response)!);
            return Content(JsonConvert.SerializeObject(mmm.ClubDescriptionDtos), "application/json");
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
            return Content(Newtonsoft.Json.JsonConvert.SerializeObject(mmm.ClubActivityDtos ?? new List<ProjectWeb.Domain.DTO.ClubActivity.GetClubActivityDto>()), "application/json");
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

        #region::Gallery

        public IActionResult GalleryContent()
        {
            return View();
        }

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
            return Content(JsonConvert.SerializeObject(mmm.GalleryDtos ?? new List<GalleryDto>()), "application/json");
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
        public async Task<IActionResult> GetActivityDetailsList()
        {
            MultipleModel mmm = new MultipleModel();
            APIResponse response = await _unitOfWork
                .ContentManagement
                .ActivityDetailsGetAll<APIResponse>("10", "1", "");

            mmm.ActivityDetailsDtos = JsonConvert.DeserializeObject<List<ActivityDetailsDto>>(Convert.ToString(response.Response)!);
            return Content(JsonConvert.SerializeObject(mmm.ActivityDetailsDtos), "application/json");
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
                .GalleryGetAll<APIResponse>("50","1","");

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
        public async Task<IActionResult> GetAchievementDetailsList()
        {
            MultipleModel mmm = new MultipleModel();
            APIResponse response = await _unitOfWork
                .ContentManagement
                .AchievementDetailsGetAll<APIResponse>("50", "1", "");

            mmm.AchievementDetailsDtos = JsonConvert.DeserializeObject<List<AchievementDetailsDto>>(Convert.ToString(response.Response)!);
            return Content(JsonConvert.SerializeObject(mmm.AchievementDetailsDtos), "application/json");
        }
        #endregion

    }
}
