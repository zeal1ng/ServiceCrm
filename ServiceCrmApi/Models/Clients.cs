using Microsoft.EntityFrameworkCore;

namespace ServiceCrmApi.Models;

public class Client
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string? Email { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<Order> Orders { get; set; } = new List<Order>();
}