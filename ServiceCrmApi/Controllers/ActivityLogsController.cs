using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ServiceCrmApi.DTOs;
using ServiceCrmApi.Models;

namespace ServiceCrmApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Manager")]
public class ActivityLogsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ActivityLogsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ActivityLogDto>>> GetLogs([FromQuery] int limit = 100)
    {
        var logs = await _context.ActivityLogs
            .OrderByDescending(l => l.CreatedAt)
            .Take(limit)
            .Select(l => new ActivityLogDto
            {
                Id = l.Id,
                UserId = l.UserId,
                UserName = l.UserName,
                Action = l.Action,
                EntityType = l.EntityType,
                EntityId = l.EntityId,
                Details = l.Details,
                CreatedAt = l.CreatedAt
            })
            .ToListAsync();

        return Ok(logs);
    }
}
