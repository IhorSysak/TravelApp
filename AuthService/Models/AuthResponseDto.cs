namespace AuthService.Models
{
    public record UserDto(
        Guid Id,
        string FirstName,
        string LastName,
        string Email,
        string Role);

    public record AuthResponseDto(string Token, UserDto User);
}
