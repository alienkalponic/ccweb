using ProjectWeb.Domain.Utility;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Application.Common.Repository.Master
{
    public interface IBaseService
    {
        APIResponse apiResponse { get; set; }
        Task<T> SendAsync<T>(APIRequest apiRequest, bool withBearer = true);
    }
}
