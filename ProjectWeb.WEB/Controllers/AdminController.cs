using AutoMapper;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ProjectWeb.Application.Common.Repository.Master;
using ProjectWeb.Domain.DTO.Banner;
using ProjectWeb.Domain.DTO.LoginDto;
using ProjectWeb.Domain.Model;
using ProjectWeb.Domain.Utility;
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

        public AdminController(IMapper mapper, IUnitOfWork unitOfWork, IHttpContextAccessor httpContextAccessor, ITokenProvider tokenProvider)
        {
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _httpContextAccessor = httpContextAccessor;
            _tokenProvider = tokenProvider;
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

        #endregion

    }
}
