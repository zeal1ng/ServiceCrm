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
public class SettingsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ActivityLogService _log;

    public SettingsController(AppDbContext context, ActivityLogService log)
    {
        _context = context;
        _log = log;
    }

    private string? GetCurrentUserName() => User.FindFirst(ClaimTypes.Name)?.Value;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SettingDto>>> GetSettings()
    {
        var settings = await _context.Settings
            .Select(s => new SettingDto
            {
                Id = s.Id,
                KeyName = s.KeyName,
                Value = s.Value,
                Description = s.Description
            })
            .ToListAsync();

        return Ok(settings);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SettingDto>> GetSetting(int id)
    {
        var setting = await _context.Settings.FindAsync(id);
        if (setting == null) return NotFound();

        return Ok(new SettingDto
        {
            Id = setting.Id,
            KeyName = setting.KeyName,
            Value = setting.Value,
            Description = setting.Description
        });
    }

    [HttpGet("by-key/{keyName}")]
    public async Task<ActionResult<SettingDto>> GetSettingByKey(string keyName)
    {
        var setting = await _context.Settings
            .FirstOrDefaultAsync(s => s.KeyName == keyName);

        if (setting == null) return NotFound();

        return Ok(new SettingDto
        {
            Id = setting.Id,
            KeyName = setting.KeyName,
            Value = setting.Value,
            Description = setting.Description
        });
    }

    [HttpPost]
    [Authorize(Roles = "Master,Admin")]
    public async Task<ActionResult<SettingDto>> CreateSetting(CreateSettingDto dto)
    {
        var existing = await _context.Settings
            .FirstOrDefaultAsync(s => s.KeyName == dto.KeyName);
        if (existing != null)
            return BadRequest("Setting with this key already exists");

        var setting = new Setting
        {
            KeyName = dto.KeyName,
            Value = dto.Value,
            Description = dto.Description
        };

        _context.Settings.Add(setting);
        await _context.SaveChangesAsync();

        await _log.LogAsync(null, GetCurrentUserName(), "Create", "Setting", setting.Id, $"Создана настройка: {setting.KeyName}");

        var resultDto = new SettingDto
        {
            Id = setting.Id,
            KeyName = setting.KeyName,
            Value = setting.Value,
            Description = setting.Description
        };

        return CreatedAtAction(nameof(GetSetting), new { id = setting.Id }, resultDto);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Master,Admin")]
    public async Task<IActionResult> UpdateSetting(int id, UpdateSettingDto dto)
    {
        var setting = await _context.Settings.FindAsync(id);
        if (setting == null) return NotFound();

        setting.Value = dto.Value;
        setting.Description = dto.Description;

        await _context.SaveChangesAsync();

        await _log.LogAsync(null, GetCurrentUserName(), "Update", "Setting", id, $"Обновлена настройка: {setting.KeyName}");

        return NoContent();
    }

    [HttpPut("by-key/{keyName}")]
    [Authorize(Roles = "Master,Admin")]
    public async Task<IActionResult> UpdateSettingByKey(string keyName, UpdateSettingDto dto)
    {
        var setting = await _context.Settings
            .FirstOrDefaultAsync(s => s.KeyName == keyName);
        if (setting == null) return NotFound();

        setting.Value = dto.Value;
        setting.Description = dto.Description;

        await _context.SaveChangesAsync();

        await _log.LogAsync(null, GetCurrentUserName(), "Update", "Setting", setting.Id, $"Обновлена настройка по ключу: {keyName}");

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Master,Admin")]
    public async Task<IActionResult> DeleteSetting(int id)
    {
        var setting = await _context.Settings.FindAsync(id);
        if (setting == null) return NotFound();

        var key = setting.KeyName;
        _context.Settings.Remove(setting);
        await _context.SaveChangesAsync();

        await _log.LogAsync(null, GetCurrentUserName(), "Delete", "Setting", id, $"Удалена настройка: {key}");

        return NoContent();
    }
}
