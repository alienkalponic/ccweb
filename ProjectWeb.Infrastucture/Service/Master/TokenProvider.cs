using Microsoft.AspNetCore.Http;
using ProjectWeb.Application.Common.Repository.Master;
using ProjectWeb.Domain.DTO;
using ProjectWeb.Domain.Utility;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Infrastucture.Service.Master
{
    public class TokenProvider : ITokenProvider
    {
        private readonly IHttpContextAccessor _contextAccessor;
        public TokenProvider(IHttpContextAccessor contextAccessor)
        {
            _contextAccessor = contextAccessor;
        }
        public void ClearToken()
        {
            _contextAccessor.HttpContext?.Response.Cookies.Delete(StaticDetails.AccessToken);
        }

        public TokenDTO? GetToken()
        {
            try
            {
                var cookies = _contextAccessor.HttpContext.Request.Cookies;

                // First, check in-memory storage (for the same request)
                if (_contextAccessor.HttpContext.Items["AccessToken"] is string inMemoryToken)
                {
                    return new TokenDTO { AccessToken = inMemoryToken };
                }

                // Then check cookies for subsequent requests
                if (_contextAccessor.HttpContext.Request.Cookies.TryGetValue(StaticDetails.AccessToken, out string accessToken))
                {
                    return new TokenDTO { AccessToken = accessToken };
                }

                return null;
            }
            catch (Exception)
            {

                return null;
            }
        }

        public void SetToken(string AccessTOken)
        {
            var cookieOptions = new CookieOptions { Expires = DateTime.UtcNow.AddDays(1) };
            _contextAccessor.HttpContext?.Response.Cookies.Append(StaticDetails.AccessToken, AccessTOken, cookieOptions);

            _contextAccessor.HttpContext.Items["AccessToken"] = AccessTOken;
        }
    }
}
