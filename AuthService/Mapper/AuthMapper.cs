using AuthService.Entities;
using AuthService.Models;
using SharedLibrary.Utility;

namespace AuthService.Mapper
{
    public static class AuthMapper
    {
        public static User ToEntity(this RegisterDto dto) => new()
        {
            Id = Guid.NewGuid(),
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = dto.IsDriver ? RoleConstants.Driver : RoleConstants.User
        };

        public static UserDto ToDto(this User user) => new(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email,
            user.Role);
    }
}
