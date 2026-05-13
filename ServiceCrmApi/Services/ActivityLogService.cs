using ServiceCrmApi.Models;

namespace ServiceCrmApi.Services;

public class ActivityLogService
{
    private readonly AppDbContext _context;

    public ActivityLogService(AppDbContext context)
    {
        _context = context;
    }

    public async Task LogAsync(int? userId, string userName, string action, string entityType, int? entityId, string? details)
    {
        _context.ActivityLogs.Add(new ActivityLog
        {
            UserId = userId,
            UserName = userName ?? "System",
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Details = details,
            CreatedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();
    }
}
