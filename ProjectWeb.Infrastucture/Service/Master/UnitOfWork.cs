using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using ProjectWeb.Application.Common.Repository.Master;
using ProjectWeb.Application.Common.Repository.SystemLogin;
using ProjectWeb.Infrastucture.Service.SystemLogin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Infrastucture.Service.Master
{
    public class UnitOfWork:IUnitOfWork
    {
        private readonly IHttpClientFactory _clientFactory;
        private readonly IConfiguration _configuration;
        private IHttpContextAccessor _contextAccessor;
        private readonly IBaseService _baseService;

        public IUserRepository User { get; private set; }

        public UnitOfWork(IHttpClientFactory clientFactory, IConfiguration configuration, IHttpContextAccessor contextAccessor, IBaseService baseService)
        {
            _clientFactory = clientFactory;
            _configuration = configuration;
            _contextAccessor = contextAccessor;
            _baseService = baseService;

            User = new UserRepository(_clientFactory, _configuration, _baseService, _contextAccessor);
        }
    }
}
