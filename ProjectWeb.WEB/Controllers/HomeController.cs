using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ProjectWeb.Application.Common.Repository.Master;
using ProjectWeb.Domain.DTO.ActivityDetails;
using ProjectWeb.Domain.DTO.Banner;
using ProjectWeb.Domain.DTO.ClubActivity;
using ProjectWeb.Domain.DTO.ClubDescription;
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

        public IActionResult Gallery()
        {
            return View();
        }

        public async Task<IActionResult> ActivityDetails(int id)
        {
            MultipleModel mmm = new MultipleModel();
            APIResponse ActivityDetailsResponse = await _unitOfWork.ContentManagement.ActivityDetailsGetByActivityId<APIResponse>(id);

            if(ActivityDetailsResponse.Success == true)
            {
                mmm.ActivityDetailsDto = JsonConvert.DeserializeObject<List<ActivityDetailsDto>>(Convert.ToString(ActivityDetailsResponse.Response)!)!.FirstOrDefault();
            }
            else
            {
                mmm.ActivityDetailsDto = null;
            }


            return View(mmm);
        }



        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
