using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Domain.DTO.LoginDto
{
    public class LoginResponseDTO
    {
        public LoginUserDetails UserDetails { get; set; }
        public string AccessToken { get; set; }
       
    }
}
