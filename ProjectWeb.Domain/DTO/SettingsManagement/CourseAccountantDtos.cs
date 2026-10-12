using System;

namespace ProjectWeb.Domain.DTO.SettingsManagement
{
    public class CourseAccountantDto
    {
        public long CourseAccountantId { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime? CreatedDate { get; set; }
    }

    public class CreateCourseAccountantDto
    {
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }

    public class UpdateCourseAccountantDto
    {
        public long CourseAccountantId { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}
