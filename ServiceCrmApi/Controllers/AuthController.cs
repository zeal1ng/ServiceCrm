using Microsoft.AspNetCore.Mvc;
using ServiceCrmApi.Models;
using ServiceCrmApi.Services;
using ServiceCrmApi.DTOs;
using System.Security.Cryptography.X509Certificates;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ITokenService _tokenService;

    public AuthController(AppDbContext context, ITokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    [HttpPost("login")]
    public ActionResult<AuthResponse> Login([FromBody] LoginRequest request)
    {
        var user = _context.Users.FirstOrDefault(u => u.Name == request.Name);
        if (user == null || !PasswordService.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid username or password" });
        }

        var token = _tokenService.CreateToken(user);
        return Ok(new { token });
    }

    [HttpPost("register")]
    public ActionResult<AuthResponse> Register([FromBody] RegisterRequest request)
    {
        if (_context.Users.Any(u => u.Name == request.Name))
        {
            return BadRequest(new { message = "Username already exists" });
        }

        var user = new User
        {
            Name = request.Name,
            PasswordHash = PasswordService.Hash(request.Password),
            Role = UserRole.Master
        };

        _context.Users.Add(user);
        _context.SaveChanges();

        var token = _tokenService.CreateToken(user);
        return Ok(new { token });
    }
}