using AuthService.Context;
using AuthService.Entities;
using AuthService.Mapper;
using AuthService.Models;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedLibrary.Repositories;

namespace AuthService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous]
    public class AuthController(AuthContext context, ITokenService tokenService, IGenericRepository<User> userRepo) : ControllerBase
    {
        [HttpPost("register")]
        public async Task<IActionResult> RegisterAsync(RegisterDto dto, CancellationToken cancellation = default)
        {
            if (await context.Users.AnyAsync(u => u.Email == dto.Email, cancellation))
                return Conflict("Email already exists.");

            var user = dto.ToEntity();

            await userRepo.CreateAsync(user, cancellation);

            var token = tokenService.GenerateToken(user);

            return Ok(new AuthResponseDto(token, user.ToDto()));
        }

        [HttpPost("login")]
        public async Task<IActionResult> LoginAsync(LoginDto dto, CancellationToken cancellation = default)
        {
            var user = await context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email, cancellation);
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized();

            var token = tokenService.GenerateToken(user);
            return Ok(new AuthResponseDto(token, user.ToDto()));
        }

        /*[HttpPost("validate")]
        [AllowAnonymous]
        public async Task<IActionResult> ValidateToken(ValidateTokenDto dto, CancellationToken cancellation = default)
        {
            var principal = tokenService.GetPrincipalFromToken(dto.Token);
            if (principal == null)
                return Unauthorized();

            var idClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(idClaim, out var userId))
                return Unauthorized();

            var user = await userRepo.GetByIdAsync(userId, cancellation);
            if (user == null)
                return NotFound();

            return Ok(user);
        }*/
    }
}
