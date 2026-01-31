using ProjectWeb.Domain.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Application.Common.Repository.Master
{
    public interface ITokenProvider
    {
        void SetToken(string AccessTOken);
        TokenDTO? GetToken();
        void ClearToken();
    }
}
