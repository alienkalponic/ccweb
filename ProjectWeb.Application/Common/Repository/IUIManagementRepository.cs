using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Application.Common.Repository
{
    public interface IUIManagementRepository
    {
        Task<T> GetAllGallery<T>();
    }
}
