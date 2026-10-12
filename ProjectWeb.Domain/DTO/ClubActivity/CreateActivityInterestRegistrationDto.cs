namespace ProjectWeb.Domain.DTO.ClubActivity
{
    public class CreateActivityInterestRegistrationDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public int ClubActivityId { get; set; }
        public string? Message { get; set; }
    }
}
