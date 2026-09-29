using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using ProjectWeb.Application.Common.Repository.Master;
using ProjectWeb.Domain.DTO.AchievementDetails;
using ProjectWeb.Domain.DTO.Banner;
using ProjectWeb.Domain.DTO.Category;
using ProjectWeb.Domain.DTO.Gallery;
using ProjectWeb.Domain.Model;
using ProjectWeb.Domain.Utility;
using System;
using System.Net.Http;
using System.Threading.Tasks;

namespace ProjectWeb.WEB.Controllers
{
    public class GalleryContentController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ITokenProvider _tokenProvider;
        private readonly IConfiguration _configuration;
        private readonly ILogger<GalleryContentController> _logger;

        public GalleryContentController(
            IMapper mapper, 
            IUnitOfWork unitOfWork, 
            IHttpContextAccessor httpContextAccessor, 
            ITokenProvider tokenProvider,
            IConfiguration configuration,
            ILogger<GalleryContentController> logger)
        {
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _httpContextAccessor = httpContextAccessor;
            _tokenProvider = tokenProvider;
            _configuration = configuration;
            _logger = logger;
        }

        // GET: GalleryContent
        public async Task<IActionResult> Index()
        {
            ViewBag.InstagramAccessToken = _configuration["InstagramSettings:AccessToken"] ?? "";
            MultipleModel mmm = new MultipleModel
            {
                GalleryListDtos = new List<GalleryListDto>(),
                CategoryDtos = new List<CategoryDto>()
            };

            try
            {
                APIResponse response = await _unitOfWork
                    .UIManagement
                    .GetAllGallery<APIResponse>();

                if (response != null && response.Success && response.Response != null)
                {
                    var rawJson = Convert.ToString(response.Response);
                    if (!string.IsNullOrWhiteSpace(rawJson))
                    {
                        mmm.GalleryListDtos = JsonConvert.DeserializeObject<List<GalleryListDto>>(rawJson) ?? new List<GalleryListDto>();
                    }
                }
                else
                {
                    _logger.LogWarning("[GalleryContent] GetAllGallery returned unsuccessful or empty response.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[GalleryContent] Error fetching gallery list in Index");
            }

            try
            {
                APIResponse categoryresponse = await _unitOfWork
                    .SettingsManagement
                    .GetAllCategory<APIResponse>();

                if (categoryresponse != null && categoryresponse.Success && categoryresponse.Response != null)
                {
                    var rawJson = Convert.ToString(categoryresponse.Response);
                    if (!string.IsNullOrWhiteSpace(rawJson))
                    {
                        mmm.CategoryDtos = JsonConvert.DeserializeObject<List<CategoryDto>>(rawJson) ?? new List<CategoryDto>();
                    }
                }
                else
                {
                    _logger.LogWarning("[GalleryContent] GetAllCategory returned unsuccessful or empty response.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[GalleryContent] Error fetching category list in Index");
            }

            return View(mmm);
        }

        // GET: GalleryContent/Details/5
        public async Task<IActionResult> Details(int id)
        {
            ViewBag.GalleryId = id;
            


            return View();
        }

        public async Task<IActionResult> GetGalleryDetails(int id)
        {
            if (id <= 0)
                return Content(JsonConvert.SerializeObject(new APIResponse { Success = false, Response = "Invalid Achievement ID." }), "application/json");
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

        // GET: GalleryContent/GetInstagramFeed
        [HttpGet]
        public async Task<IActionResult> GetInstagramFeed()
        {
            var token = _configuration["InstagramSettings:AccessToken"];
            if (string.IsNullOrWhiteSpace(token))
            {
                return Json(new { success = false, message = "Instagram Access Token is missing in appsettings.json" });
            }

            try
            {
                using var client = new HttpClient();
                string url = $"https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count&access_token={token.Trim()}&limit=16";
                
                var response = await client.GetAsync(url);
                var jsonString = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    return Content(jsonString, "application/json");
                }
                else
                {
                    return Json(new { success = false, message = "Instagram API request failed.", error = jsonString });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }
    }
}
