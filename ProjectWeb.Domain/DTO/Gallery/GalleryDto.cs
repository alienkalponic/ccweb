using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;

namespace ProjectWeb.Domain.DTO.Gallery
{
    public class GalleryDto
    {
        public int GalleryItemsId { get; set; }
        public string Title { get; set; } = default!;
        public string? SubTitle { get; set; }
        public string ExpeditionYear { get; set; } = default!;
        public string? ImageUrl { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    public class CreateGalleryDto
    {
        public string Title { get; set; } = default!;
        public string? SubTitle { get; set; }
        public string ExpeditionYear { get; set; } = default!;
        public IFormFile File { get; set; } = default!;
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
    }

    public class UpdateGalleryDto
    {
        public int GalleryItemsId { get; set; }
        public string Title { get; set; } = default!;
        public string? SubTitle { get; set; }
        public string ExpeditionYear { get; set; } = default!;
        public IFormFile? File { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
    }
}
