using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Domain.Utility
{
    public static class StaticDetails
    {
        public enum ApiType
        {
            GET,
            POST,
            PUT,
            DELETE
        }

        public static string AccessToken = "JWTToken";
        public static string UserId = "";
        public static string RoleName = "role";
        public enum ContentType
        {
            Json,
            MultipartFormData,
        }
    }
}
