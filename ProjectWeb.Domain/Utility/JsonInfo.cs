using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Domain.Utility
{
    public class JsonInfo<T>
    {
        public string Status { get; set; }
        public List<T> Response { get; set; }
    }

    public class ResponseData<T>
    {
        public List<T> Response { get; set; }
    }
}
