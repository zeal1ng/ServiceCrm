using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace ServiceCrmApi.Models;

public enum OrderPriority { Normal, High, VIP }
public class Order
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public Client? Client { get; set; }
    public string? Device { get; set; }
    public string? Serial { get; set; }
    public string? Issue { get; set; }
    public string? Diagnosis { get; set; }
    public OrderPriority Priority { get; set; } = OrderPriority.Normal;
    public string? Status { get; set; } = "New";
    public int? UserId { get; set; }
    public User? User { get; set; }
    [Column(TypeName = "decimal(10,2)")]
    public decimal Cost { get; set; }
    [Column(TypeName = "decimal(10,2)")]
    public decimal Paid { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public List<Transaction> Transactions { get; set; } = new List<Transaction>();
}