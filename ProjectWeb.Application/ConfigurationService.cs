using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Application
{
    public static class ConfigurationService
    {
        public static IServiceCollection AddApplicationService(this IServiceCollection service)
        {
            service.AddAutoMapper(Assembly.GetExecutingAssembly());

            return service;
        }
    }
}
