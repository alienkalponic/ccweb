using ProjectWeb.Application.Common.Repository.SystemLogin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Application.Common.Repository.Master
{
    public interface IUnitOfWork
    {
        IUserRepository User { get; }
        IContentManagement ContentManagement { get; }
        }
}
