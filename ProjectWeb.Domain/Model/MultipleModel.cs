using ProjectWeb.Domain.DTO.ActivityDetails;
using ProjectWeb.Domain.DTO.Banner;
using ProjectWeb.Domain.DTO.ClubDescription;
using ProjectWeb.Domain.DTO.Gallery;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Domain.Model
{
    public class MultipleModel
    {
        public BannerCreateDto? BannerCreateDto { get; set; }
        public List<BannerDto>? BannerDtos { get; set; }
        public BannerDto? BannerDto { get; set; }
        public BannerUpdateDto? BannerUpdateDto { get; set; }
        public CreateClubDescriptionDto? CreateClubDescriptionDto { get; set; }
        public List<GetClubDescriptionDto>? ClubDescriptionDtos { get; set; }
        public GetClubDescriptionDto? ClubDescriptionDto { get; set; }
        public UpdateClubDescriptionRequestDto? UpdateClubDescriptionDto { get; set; }

        // Club Activity
        public ProjectWeb.Domain.DTO.ClubActivity.CreateClubActivityDto? CreateClubActivityDto { get; set; }
        public ProjectWeb.Domain.DTO.ClubActivity.UpdateClubActivityDto? UpdateClubActivityDto { get; set; }
        public List<ProjectWeb.Domain.DTO.ClubActivity.GetClubActivityDto>? ClubActivityDtos { get; set; }
        public ProjectWeb.Domain.DTO.ClubActivity.GetClubActivityDto? ClubActivityDto { get; set; }

        // Gallery
        public CreateGalleryDto? CreateGalleryDto { get; set; }
        public UpdateGalleryDto? UpdateGalleryDto { get; set; }
        public List<GalleryDto>? GalleryDtos { get; set; }
        public GalleryDto? GalleryDto { get; set; }
        public CreateActivityDetailsDto? CreateActivityDetailsDto { get; set; }
        public UpdateActivityDetailsDto? UpdateActivityDetailsDto { get; set; }
        public ActivityDetailsDto? ActivityDetailsDto { get; set; }
        public List<ActivityDetailsDto>? ActivityDetailsDtos { get; set; }

    }
}
