using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Domain.DTO.LoginDto
{
    public class LoginUserDetails
    {
        public long ContactId { get; set; }
        public long RoleId { get; set; }
        public string MSHClientNumber { get; set; }
        public string TitleId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNo1 { get; set; }
        public string PhoneNo2 { get; set; }
        public string EmailAddress { get; set; }
        public string EmailAddress1 { get; set; }
        public string JobTitle { get; set; }
        public string ContactNote { get; set; }
        public short MonthOfBirth { get; set; }
        public short YearOfBirth { get; set; }
        public string Gender { get; set; }
        public long AssignedToUserId { get; set; }
        public long BuyingCriteriaStatusId { get; set; }
        public DateTime? LastOrdered { get; set; }
        public bool IsActive { get; set; }
        public bool HasViewedT_C { get; set; }
        public bool HasSubscribedToNewsletter { get; set; }
        public bool HasOptedForRewards_Offers { get; set; }
        public DateTime CreatedDate { get; set; }
        public string CreatedBy { get; set; }
        public DateTime UpdatedDate { get; set; }
        public string UpdatedBy { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime DeletedDate { get; set; }
        public long DeletedBy { get; set; }
        public string TherapistId { get; set; }

        public string UserEmail { get; set; }
        public string Password { get; set; }
        public string PhoneNumber { get; set; }
        public DateTime? LastLogin { get; set; }
        public string ProfileImageUrl { get; set; }
        public bool TwoWayVerification { get; set; }
        public string RoleName { get; set; }
        public string PatchTestStatusId { get; set; }
    }
}
