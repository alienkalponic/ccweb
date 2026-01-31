using ProjectWeb.Domain.DTO.LoginDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Application.Common.Repository.SystemLogin
{
    public interface IUserRepository
    {
        Task<T> LoginAsync<T>(LoginRequestDTO objToCreate);
        Task<T> GenerateNewTokenAsync<T>(long userId);
    }
}
