using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectWeb.Application.Common.Repository.Master;

namespace ProjectWeb.WEB.Controllers
{
    public class DashboardController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private IHttpContextAccessor _httpContextAccessor;
        private readonly ITokenProvider _tokenProvider;
        public DashboardController(IMapper mapper, IUnitOfWork unitOfWork, IHttpContextAccessor httpContextAccessor, ITokenProvider tokenProvider)
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
        [Authorize]
        public async Task<IActionResult> Dashboard()
        {
            return View();
        }
    }
}
