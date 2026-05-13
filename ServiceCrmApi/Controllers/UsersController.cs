using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ServiceCrmApi.Models;
using ServiceCrmApi.DTOs;
using ServiceCrmApi.Services;
using System.Security.Claims;

namespace ServiceCrmApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ActivityLogService _log;

    public UsersController(AppDbContext context, ActivityLogService log)
    {
        _context = context;
        _log = log;
    }

    private (int? id, string? name) GetCurrentUser()
    {
        var idStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var name = User.FindFirst(ClaimTypes.Name)?.Value;
        return (idStr != null ? int.Parse(idStr) : null, name);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
    {
        var users = await _context.Users
            .Select(u => new UserDto
            {
                Id = u.Id,
                Name = u.Name,
                Phone = u.Phone,
                Email = u.Email,
                Role = u.Role.ToString(),
                Specialization = u.Specialization,
                Comission_percent = u.Comission_percent,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();

        return Ok(new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Phone = user.Phone,
            Email = user.Email,
            Role = user.Role.ToString(),
            Specialization = user.Specialization,
            Comission_percent = user.Comission_percent,
            CreatedAt = user.CreatedAt
        });
    }

    [HttpPost]
    [Authorize(Roles = "Master,Admin")]
    public async Task<ActionResult<UserDto>> CreateUser(CreateUserDto dto)
    {
        if (!Enum.TryParse<UserRole>(dto.Role, true, out var role))
            role = UserRole.Manager;

        var user = new User
        {
            Name = dto.Name,
            Phone = dto.Phone,
            Email = dto.Email,
            PasswordHash = PasswordService.Hash(dto.Password),
            Role = role,
            Specialization = dto.Specialization,
            Comission_percent = dto.Comission_percent,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var (_, curName) = GetCurrentUser();
        await _log.LogAsync(null, curName ?? "System", "Create", "User", user.Id, $"Создан сотрудник: {user.Name}");

        var resultDto = new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Phone = user.Phone,
            Email = user.Email,
            Role = user.Role.ToString(),
            Specialization = user.Specialization,
            Comission_percent = user.Comission_percent,
            CreatedAt = user.CreatedAt
        };

        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, resultDto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, UpdateUserDto dto)
    {
        var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var currentRole = User.FindFirst(ClaimTypes.Role)?.Value;
        bool isAdmin = currentRole == "Admin";

        if (!isAdmin && currentUserId != id)
            return Forbid();

        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();

        user.Name = dto.Name;
        user.Phone = dto.Phone;
        user.Email = dto.Email;

        if (isAdmin && Enum.TryParse<UserRole>(dto.Role, true, out var role))
            user.Role = role;

        user.Specialization = dto.Specialization;
        user.Comission_percent = dto.Comission_percent;

        await _context.SaveChangesAsync();

        var (_, curName2) = GetCurrentUser();
        await _log.LogAsync(currentUserId, curName2, "Update", "User", id, $"Обновлён сотрудник: {user.Name}");

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();

        var name = user.Name;
        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        var (_, curName3) = GetCurrentUser();
        await _log.LogAsync(null, curName3, "Delete", "User", id, $"Удалён сотрудник: {name}");

        return NoContent();
    }
}
