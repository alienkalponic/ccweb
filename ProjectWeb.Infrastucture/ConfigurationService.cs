using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ProjectWeb.Application;
using ProjectWeb.Application.Common.Repository.Master;
using ProjectWeb.Infrastucture.Service.Master;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Infrastucture
{
    public static class ConfigurationService
    {
        public static IServiceCollection AddInfrastructureService(this IServiceCollection services)
        {
            services.AddApplicationService();//Application Layer Configure Service register
            services.AddHttpClient<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IBaseService, BaseService>();
            services.AddScoped<ITokenProvider, TokenProvider>();
            services.AddSingleton<IApiMessageRequestBuilder, ApiMessageRequestBuilder>();
            services.AddHttpContextAccessor();

            return services;
        }
    }
}
