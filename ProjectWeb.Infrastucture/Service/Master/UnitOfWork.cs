using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ProjectWeb.Application.Common.Repository;
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
    public class UnitOfWork : IUnitOfWork
    {
        private readonly IHttpClientFactory _clientFactory;
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _contextAccessor;
        private readonly IBaseService _baseService;
        private readonly ILoggerFactory _loggerFactory;

        public IUserRepository User { get; private set; }
        public IContentManagement ContentManagement { get; private set; }

        public UnitOfWork(
            IHttpClientFactory clientFactory, 
            IConfiguration configuration, 
            IHttpContextAccessor contextAccessor, 
            IBaseService baseService,
            ILoggerFactory loggerFactory)
        {
            _clientFactory = clientFactory;
            _configuration = configuration;
            _contextAccessor = contextAccessor;
            _baseService = baseService;
            _loggerFactory = loggerFactory;

            // Pass the factory-created loggers to the sub-repositories.
            User = new UserRepository(
                _clientFactory, 
                _configuration, 
                _baseService, 
                _contextAccessor,
                _loggerFactory.CreateLogger<UserRepository>());

            ContentManagement = new ContentManagementRespository(
                _clientFactory, 
                _configuration, 
                _baseService, 
                _contextAccessor,
                _loggerFactory.CreateLogger<ContentManagementRespository>());
        }
    }
}
