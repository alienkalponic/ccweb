using System;

namespace ProjectWeb.Domain.DTO.SettingsManagement
{
    public class CourseExpenseCategoryDto
    {
        public long CourseExpenseCategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime? CreatedDate { get; set; }
    }

    public class CreateCourseExpenseCategoryDto
    {
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }

    public class UpdateCourseExpenseCategoryDto
    {
        public long CourseExpenseCategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}
