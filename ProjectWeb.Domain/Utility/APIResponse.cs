using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Domain.Utility
{
    public class APIResponse
    {
        public APIResponse()
        {
            ErrorMassage = new List<string>();
        }
        public HttpStatusCode StatusCode { get; set; }
        public bool Success { get; set; }
        public List<string> ErrorMassage { get; set; }
        public object? Response { get; set; }
        public int TotalItem { get; set; }
        public int ItemsPerPage { get; set; }
        public int CurrentPage { get; set; }
        public int TotalPageCount { get; set; }
    }
}
