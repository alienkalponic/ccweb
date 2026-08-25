using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ProjectWeb.Application.Common.Repository.Master;
using ProjectWeb.Domain.DTO.AchievementDetails;
using ProjectWeb.Domain.DTO.ActivityDetails;
using ProjectWeb.Domain.DTO.Banner;
using ProjectWeb.Domain.DTO.ClubActivity;
using ProjectWeb.Domain.DTO.ClubDescription;
using ProjectWeb.Domain.DTO.Gallery;
using ProjectWeb.Domain.Model;
using ProjectWeb.Domain.Utility;
using ProjectWeb.WEB.Models;
using System.Diagnostics;

namespace ProjectWeb.WEB.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IUnitOfWork _unitOfWork;

        public HomeController(ILogger<HomeController> logger, IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<IActionResult> Index()
        {
            MultipleModel mmm = new MultipleModel();
            APIResponse response =await _unitOfWork
                .ContentManagement
                .BannerGetAll<APIResponse>("10", "1", "");

            mmm.BannerDtos = JsonConvert.DeserializeObject<List<BannerDto>>(Convert.ToString(response.Response)!);

            
            APIResponse ClubDescriptionresponse = await _unitOfWork
                .ContentManagement
                .DescriptionGetAll<APIResponse>("10", "1", "");

            mmm.ClubDescriptionDtos = JsonConvert.DeserializeObject<List<GetClubDescriptionDto>>(Convert.ToString(ClubDescriptionresponse.Response)!);

            APIResponse ClubActivityResponse = await _unitOfWork.ContentManagement.ActivityGetAll<APIResponse>("100", "1", "");

            mmm.ClubActivityDtos = JsonConvert.DeserializeObject<List<GetClubActivityDto>>(Convert.ToString(ClubActivityResponse.Response)!);

            APIResponse AchievementDetailsGallery = await _unitOfWork
                .ContentManagement
                .GalleryGetAll<APIResponse>("100", "1", "");
            mmm.galleryDtos = JsonConvert.DeserializeObject<List<GalleryDto>>(Convert.ToString(AchievementDetailsGallery.Response)!);

            return View(mmm);
        }

        public IActionResult About()
        {
            return View();
        }

        public IActionResult ContactUs()
        {
            return View();
        }

        public async Task<IActionResult> Gallery(int id)
        {
            MultipleModel mmm = new MultipleModel();
            APIResponse apiResponse = await _unitOfWork
                .ContentManagement
                .AchievementDetailsGalleryItemsId<APIResponse>(id);

            var responseString = Convert.ToString(apiResponse.Response) ?? string.Empty;
            AchievementDetailsGalleryDtos? parent = null;

            try
            {
                // If API returns an array, take first item; if it returns an object, deserialize directly.
                var trimmed = responseString.TrimStart();
                if (trimmed.StartsWith("["))
                {
                    var list = JsonConvert.DeserializeObject<List<AchievementDetailsGalleryDtos>>(responseString);
                    parent = list?.Count > 0 ? list[0] : null;
                }
                else
                {
                    parent = JsonConvert.DeserializeObject<AchievementDetailsGalleryDtos>(responseString);
                }
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Failed to deserialize parent AchievementDetailsGalleryDtos for id {Id}", id);
            }

            // Parse inner JSON (string) to strongly-typed child list
            if (parent != null && !string.IsNullOrWhiteSpace(parent.AchievementDetailsGalleryDetails))
            {
                try
                {
                    parent.AchievementDetailsGalleryDetailsList =
                        JsonConvert.DeserializeObject<List<AchievementDetailsGalleryDetailDto>>(parent.AchievementDetailsGalleryDetails);
                }
                catch (JsonException ex)
                {
                    _logger.LogError(ex, "Failed to parse AchievementDetailsGalleryDetails for GalleryItemsId {GalleryItemsId}", parent.GalleryItemsId);
                    parent.AchievementDetailsGalleryDetailsList = new List<AchievementDetailsGalleryDetailDto>();
                }
            }
            else if (parent != null)
            {
                parent.AchievementDetailsGalleryDetailsList = new List<AchievementDetailsGalleryDetailDto>();
            }

            mmm.AchievementDetailsGalleryDtos = parent;
            return View(mmm);
        }

        public async Task<IActionResult> ActivityInfoDetails(int id)
        {
            MultipleModel mmm = new MultipleModel();
            APIResponse ActivityDetailsResponse = await _unitOfWork.ContentManagement.ActivityDetailsGetByActivityId<APIResponse>(id);

            if (ActivityDetailsResponse.Success == true)
            {
                mmm.ActivityDetailsDto = JsonConvert.DeserializeObject<List<ActivityDetailsDto>>(Convert.ToString(ActivityDetailsResponse.Response)!)!.FirstOrDefault();
            }
            else
            {
                mmm.ActivityDetailsDto = null;
            }


            return View(mmm);
        }

        [HttpPost]
        public async Task<IActionResult> CreateActivityInterest([FromBody] CreateActivityInterestRegistrationDto dto)
        {
            try
            {
                APIResponse response = await _unitOfWork
                    .ContentManagement
                    .CreateActivityInterest<APIResponse>(dto);

                return Json(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating activity interest");
                return Json(new APIResponse
                {
                    Success = false,
                    ErrorMassage = new List<string> { ex.Message }
                });
            }
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
