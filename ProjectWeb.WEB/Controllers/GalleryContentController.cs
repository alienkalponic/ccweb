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
        public async Task<IActionResult> Details(int id, int? galleryItemsId = null, string? title = null, string? category = null, int? year = null)
        {
            ViewBag.GalleryId = id;
            ViewBag.GalleryItemsId = galleryItemsId ?? (id == 32 ? 32 : 0);
            ViewBag.AlbumTitle = title ?? "";
            ViewBag.CategoryName = category ?? "";
            ViewBag.ExpeditionYear = year ?? 0;

            // Direct mapping for Gajaburu South Face (Archive #8 / GalleryItem #32)
            if (id == 32 || id == 8 || galleryItemsId == 32)
            {
                ViewBag.AlbumTitle = "GAJABURU SOUTH FACE";
                ViewBag.CategoryName = "LEAD CLIMB";
                ViewBag.GalleryItemsId = 32;
                if (id == 32) ViewBag.GalleryId = 8;
            }

            // 1. If title is still missing, try querying AchievementDetailsGalleryItemsId
            if (string.IsNullOrWhiteSpace(ViewBag.AlbumTitle as string))
            {
                long targetGId = galleryItemsId.HasValue && galleryItemsId.Value > 0 ? (long)galleryItemsId.Value : (long)id;
                try
                {
                    APIResponse gRes = await _unitOfWork.ContentManagement.AchievementDetailsGalleryItemsId<APIResponse>(targetGId);
                    if (gRes?.Response != null)
                    {
                        var gStr = Convert.ToString(gRes.Response);
                        if (!string.IsNullOrWhiteSpace(gStr))
                        {
                            var trimmed = gStr.TrimStart();
                            AchievementDetailsGalleryDtos? parent = trimmed.StartsWith("[")
                                ? JsonConvert.DeserializeObject<List<AchievementDetailsGalleryDtos>>(gStr)?.FirstOrDefault()
                                : JsonConvert.DeserializeObject<AchievementDetailsGalleryDtos>(gStr);

                            if (parent != null)
                            {
                                if (!string.IsNullOrWhiteSpace(parent.Title)) ViewBag.AlbumTitle = parent.Title;
                                if (!string.IsNullOrWhiteSpace(parent.SubTitle)) ViewBag.CategoryName = parent.SubTitle;
                                if (parent.GalleryItemsId.HasValue && parent.GalleryItemsId.Value > 0) ViewBag.GalleryItemsId = (int)parent.GalleryItemsId.Value;
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Could not fetch AchievementDetailsGalleryItemsId for id {Id}", id);
                }
            }

            // 2. If title is still missing, try AchievementDetailsGet(id)
            if (string.IsNullOrWhiteSpace(ViewBag.AlbumTitle as string))
            {
                try
                {
                    APIResponse achRes = await _unitOfWork.ContentManagement.AchievementDetailsGet<APIResponse>(id);
                    if (achRes?.Response != null)
                    {
                        var achStr = Convert.ToString(achRes.Response);
                        if (!string.IsNullOrWhiteSpace(achStr))
                        {
                            var trimmed = achStr.TrimStart();
                            var achDto = trimmed.StartsWith("[")
                                ? JsonConvert.DeserializeObject<List<AchievementDetailsUpdateDto>>(achStr)?.FirstOrDefault()
                                : JsonConvert.DeserializeObject<AchievementDetailsUpdateDto>(achStr);

                            if (achDto != null)
                            {
                                if (!string.IsNullOrWhiteSpace(achDto.Title)) ViewBag.AlbumTitle = achDto.Title;
                                if (!string.IsNullOrWhiteSpace(achDto.SubTitle)) ViewBag.CategoryName = achDto.SubTitle;
                                if (achDto.GalleryItemsId.HasValue && achDto.GalleryItemsId.Value > 0) ViewBag.GalleryItemsId = (int)achDto.GalleryItemsId.Value;
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Could not fetch AchievementDetailsGet for id {Id}", id);
                }
            }

            // 3. Fallback: Lookup in GetAllGallery
            if (string.IsNullOrWhiteSpace(ViewBag.AlbumTitle as string) || (int)ViewBag.GalleryItemsId <= 0)
            {
                try
                {
                    APIResponse allRes = await _unitOfWork.UIManagement.GetAllGallery<APIResponse>();
                    if (allRes != null && allRes.Success && allRes.Response != null)
                    {
                        var rawJson = Convert.ToString(allRes.Response);
                        if (!string.IsNullOrWhiteSpace(rawJson))
                        {
                            var list = JsonConvert.DeserializeObject<List<GalleryListDto>>(rawJson);
                            var matched = list?.FirstOrDefault(x => x.AchievementDetailsId == id || x.GalleryItemsId == id);
                            if (matched != null)
                            {
                                if (matched.GalleryItemsId > 0 && (int)ViewBag.GalleryItemsId <= 0)
                                    ViewBag.GalleryItemsId = matched.GalleryItemsId;
                                if (string.IsNullOrWhiteSpace(ViewBag.AlbumTitle as string))
                                    ViewBag.AlbumTitle = matched.Title ?? "";
                                if (string.IsNullOrWhiteSpace(ViewBag.CategoryName as string))
                                    ViewBag.CategoryName = matched.CategoryName ?? "";
                                if (ViewBag.ExpeditionYear == null || (int)ViewBag.ExpeditionYear <= 0)
                                    ViewBag.ExpeditionYear = matched.ExpeditionYear;
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "[GalleryContent] Error resolving album metadata in Details for id {Id}", id);
                }
            }

            return View();
        }

        public async Task<IActionResult> GetGalleryDetails(int id)
        {
            if (id <= 0)
                return Content(JsonConvert.SerializeObject(new APIResponse { Success = false, Response = "Invalid Achievement ID." }), "application/json");

            List<AchievementDetailsGalleryUpdateDto> list = new List<AchievementDetailsGalleryUpdateDto>();

            try
            {
                APIResponse response = await _unitOfWork
                    .ContentManagement
                    .AchievementDetailsGalleryGetByAchievementId<APIResponse>(id);

                var stringResponse = Convert.ToString(response?.Response);
                if (!string.IsNullOrEmpty(stringResponse))
                {
                    list = JsonConvert.DeserializeObject<List<AchievementDetailsGalleryUpdateDto>>(stringResponse) ?? new List<AchievementDetailsGalleryUpdateDto>();
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "AchievementDetailsGalleryGetByAchievementId failed for id {Id}", id);
            }

            // Fallback: If id is 32 or list is empty, try AchievementDetailsGalleryItemsId
            if (list == null || list.Count == 0)
            {
                long targetItemId = id == 8 ? 32 : (long)id;
                try
                {
                    APIResponse gRes = await _unitOfWork
                        .ContentManagement
                        .AchievementDetailsGalleryItemsId<APIResponse>(targetItemId);

                    var gStr = Convert.ToString(gRes?.Response);
                    if (!string.IsNullOrWhiteSpace(gStr))
                    {
                        var trimmed = gStr.TrimStart();
                        AchievementDetailsGalleryDtos? parent = trimmed.StartsWith("[")
                            ? JsonConvert.DeserializeObject<List<AchievementDetailsGalleryDtos>>(gStr)?.FirstOrDefault()
                            : JsonConvert.DeserializeObject<AchievementDetailsGalleryDtos>(gStr);

                        if (parent != null && !string.IsNullOrWhiteSpace(parent.AchievementDetailsGalleryDetails))
                        {
                            var childList = JsonConvert.DeserializeObject<List<AchievementDetailsGalleryDetailDto>>(parent.AchievementDetailsGalleryDetails);
                            if (childList != null && childList.Count > 0)
                            {
                                list = childList.Select(c => new AchievementDetailsGalleryUpdateDto
                                {
                                    AchievementDetailsGalleryId = c.AchievementDetailsGalleryId,
                                    AchievementDetailsId = c.AchievementDetailsId,
                                    Title = c.Title,
                                    Description = c.Description,
                                    ImagePath1 = c.ImagePath1,
                                    DisplayOrder = c.DisplayOrder,
                                    IsActive = c.IsActive
                                }).ToList();
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "AchievementDetailsGalleryItemsId fallback failed in GetGalleryDetails for id {Id}", id);
                }
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
