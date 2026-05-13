namespace ServiceCrmApi.DTOs;

public class ActivityLogDto
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public string UserName { get; set; } = null!;
    public string Action { get; set; } = null!;
    public string EntityType { get; set; } = null!;
    public int? EntityId { get; set; }
    public string? Details { get; set; }
    public DateTime CreatedAt { get; set; }
}
