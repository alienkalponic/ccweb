using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;

namespace ProjectWeb.Domain.DTO.AboutPage
{
    public class AboutPageSectionDto
    {
        public long AboutPageSectionId { get; set; }
        public long AboutPageId { get; set; }
        public string? SectionType { get; set; }
        public string? SectionTitle { get; set; }
        public string? SectionSubtitle { get; set; }
        public string? SectionDescription { get; set; }
        public string? Content { get; set; }
        public int DisplayOrder { get; set; } = 0;
        public bool IsVisible { get; set; } = true;
        public bool IsActive { get; set; } = true;
        public string? CreatedBy { get; set; }
    }

    public class AboutDetailsDto
    {
        public long AboutDetailsId { get; set; }
        public long AboutPageId { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public IFormFile? ImageFile { get; set; }
        public int DisplayOrder { get; set; } = 0;
        public bool IsActive { get; set; } = true;
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
    }

    public class AboutPersonDto
    {
        public long PersonId { get; set; }
        public long AboutPageId { get; set; }
        public string? PersonName { get; set; }
        public string? FullDescription { get; set; }
        public string? ImageUrl { get; set; }
        public IFormFile? ImageFile { get; set; }
        public int DisplayOrder { get; set; } = 0;
        public bool IsActive { get; set; } = true;
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
    }

    public class AboutPageDto
    {
        public long AboutPageId { get; set; }
        public string? PageTitle { get; set; }
        public string? PageSlug { get; set; }
        public string? HeroTitle { get; set; }
        public string? HeroSubtitle { get; set; }
        public string? HistoryTitle { get; set; }
        public string? HistoryDescription { get; set; }
        public string? MapTitle { get; set; }
        public string? MapAddress { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string? BannerImageUrl { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime? CreatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? UpdatedBy { get; set; }

        public List<AboutPageSectionDto>? AboutPageSection { get; set; } = new();
        public List<AboutDetailsDto>? AboutDetails { get; set; } = new();
        public List<AboutPersonDto>? AboutPerson { get; set; } = new();
    }

    public class CreateAboutPageDto
    {
        public AboutPageDto? AboutPage { get; set; } = new();
        public IFormFile? BannerFile { get; set; }
        public List<AboutPageSectionDto>? AboutPageSection { get; set; } = new();
        public List<AboutDetailsDto>? AboutDetails { get; set; } = new();
        public List<AboutPersonDto>? AboutPerson { get; set; } = new();
        public long? CreatedBy { get; set; }
    }

    public class UpdateAboutPageDto
    {
        public long AboutPageId { get; set; }
        public AboutPageDto? AboutPage { get; set; } = new();
        public IFormFile? BannerFile { get; set; }
        public List<AboutPageSectionDto>? AboutPageSection { get; set; } = new();
        public List<AboutDetailsDto>? AboutDetails { get; set; } = new();
        public List<AboutPersonDto>? AboutPerson { get; set; } = new();
        public long? UpdatedBy { get; set; }
        public long? DeletedBy { get; set; }
    }
}
