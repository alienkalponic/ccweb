using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using ProjectWeb.Application.Common.Repository.Master;

namespace ProjectWeb.WEB.Controllers
{
    public class GalleryContentController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private IHttpContextAccessor _httpContextAccessor;
        private readonly ITokenProvider _tokenProvider;

        public GalleryContentController(IMapper mapper, IUnitOfWork unitOfWork, IHttpContextAccessor httpContextAccessor, ITokenProvider tokenProvider)
        {
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _httpContextAccessor = httpContextAccessor;
            _tokenProvider = tokenProvider;
        }

        // GET: GalleryContent
        public IActionResult Index()
        {
            return View();
        }

        // GET: GalleryContent/Details/5
        public IActionResult Details(int id)
        {
            ViewBag.GalleryId = id;
            return View();
        }
    }
}
