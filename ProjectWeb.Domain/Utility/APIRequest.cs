using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static ProjectWeb.Domain.Utility.StaticDetails;

namespace ProjectWeb.Domain.Utility
{
    public class APIRequest
    {
        public ApiType ApiType { get; set; } = ApiType.GET;
        public string Url { get; set; }
        public object Data { get; set; }
        public string? Token { get; set; }

        public ContentType ContentType { get; set; } = ContentType.Json;
    }
}
