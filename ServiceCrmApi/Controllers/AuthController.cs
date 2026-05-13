using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ServiceCrmApi.Models;
using ServiceCrmApi.Services;
using ServiceCrmApi.DTOs;

namespace ServiceCrmApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly ActivityLogService _log;

    public AuthController(AppDbContext context, ITokenService tokenService, ActivityLogService log)
    {
        _context = context;
        _tokenService = tokenService;
        _log = log;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Name == request.Name);
        if (user == null || !PasswordService.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid username or password" });
        }

        var token = _tokenService.CreateToken(user);
        await _log.LogAsync(user.Id, user.Name, "Login", "User", user.Id, "Вход в систему");
        return Ok(new { token });
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Name == request.Name))
        {
            return BadRequest(new { message = "Username already exists" });
        }

        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = PasswordService.Hash(request.Password),
            Role = UserRole.Master
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = _tokenService.CreateToken(user);
        await _log.LogAsync(user.Id, user.Name, "Register", "User", user.Id, "Регистрация нового пользователя");
        return Ok(new { token });
    }
}