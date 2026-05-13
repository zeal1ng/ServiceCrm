using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace ServiceCrmApi.Models;

public class ActivityLog
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    [MaxLength(200)]
    public string UserName { get; set; } = null!;
    [MaxLength(50)]
    public string Action { get; set; } = null!;
    [MaxLength(50)]
    public string EntityType { get; set; } = null!;
    public int? EntityId { get; set; }
    [MaxLength(500)]
    public string? Details { get; set; }
    public DateTime CreatedAt { get; set; }
}
