using ProjectWeb.Domain.DTO.SettingsManagement;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Application.Common.Repository
{
    public interface ISettingsManagementRepository
    {
        Task<T> GetAllCategory<T>();

        // Course Accountant / Payment Receiver Settings
        Task<T> GetAllCourseAccountant<T>();
        Task<T> GetCourseAccountantById<T>(long id);
        Task<T> CreateCourseAccountant<T>(CreateCourseAccountantDto dto);
        Task<T> UpdateCourseAccountant<T>(UpdateCourseAccountantDto dto);
        Task<T> InactiveCourseAccountant<T>(long id);
        Task<T> DeleteCourseAccountant<T>(long id);
        Task<T> UpdateCourseAccountantStatus<T>(long id, bool isActive);

        // Course Expense Category Settings
        Task<T> GetAllCourseExpenseCategory<T>(bool? isActive = null);
        Task<T> GetCourseExpenseCategoryById<T>(long id);
        Task<T> CreateCourseExpenseCategory<T>(CreateCourseExpenseCategoryDto dto);
        Task<T> UpdateCourseExpenseCategory<T>(UpdateCourseExpenseCategoryDto dto);
        Task<T> InactiveCourseExpenseCategory<T>(long id);
        Task<T> DeleteCourseExpenseCategory<T>(long id);
        Task<T> UpdateCourseExpenseCategoryStatus<T>(long id, bool isActive);
    }
}
