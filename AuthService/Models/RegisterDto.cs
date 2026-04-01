namespace AuthService.Models
{
    public record RegisterDto(string FirstName, string LastName, string Email, string Password, bool IsDriver);
}
