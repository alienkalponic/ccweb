using System;
using System.Collections.Generic;

namespace ProjectWeb.Domain.DTO.AchievementDetails
{
    // Parent DTO (single object)
    public class AchievementDetailsGalleryDtos
    {
        public long AchievementDetailsId { get; set; }
        public long? GalleryItemsId { get; set; }
        public string? Title { get; set; }
        public string? SubTitle { get; set; }
        public bool? IsActive { get; set; }

        // raw JSON string returned by API for child items
        public string? AchievementDetailsGalleryDetails { get; set; }

        // parsed, strongly-typed child list to use in views
        public List<AchievementDetailsGalleryDetailDto>? AchievementDetailsGalleryDetailsList { get; set; }
    }

    // Child DTO (items inside the inner JSON array)
    public class AchievementDetailsGalleryDetailDto
    {
        public long AchievementDetailsGalleryId { get; set; }
        public long AchievementDetailsId { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? ImagePath1 { get; set; }
        public int? DisplayOrder { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
