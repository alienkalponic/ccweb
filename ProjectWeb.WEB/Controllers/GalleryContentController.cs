using System;
using System.Net.Http;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using ProjectWeb.Application.Common.Repository.Master;

namespace ProjectWeb.WEB.Controllers
{
    public class GalleryContentController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ITokenProvider _tokenProvider;
        private readonly IConfiguration _configuration;

        public GalleryContentController(
            IMapper mapper, 
            IUnitOfWork unitOfWork, 
            IHttpContextAccessor httpContextAccessor, 
            ITokenProvider tokenProvider,
            IConfiguration configuration)
        {
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _httpContextAccessor = httpContextAccessor;
            _tokenProvider = tokenProvider;
            _configuration = configuration;
        }

        // GET: GalleryContent
        public IActionResult Index()
        {
            ViewBag.InstagramAccessToken = _configuration["InstagramSettings:AccessToken"] ?? "";
            return View();
        }

        // GET: GalleryContent/Details/5
        public IActionResult Details(int id)
        {
            ViewBag.GalleryId = id;
            return View();
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
                string url = $"https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count&access_token={token.Trim()}&limit=12";
                
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
