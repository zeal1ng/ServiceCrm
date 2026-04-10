namespace ServiceCrmApi.Models;

public enum OrderPriority
{
    Normal,
    High,
    VIP
}
public class Order
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public string? Device { get; set; }
    public string? Serial { get; set; }
    public string? Issue { get; set; }
    public string? Diagnosis { get; set; }
    public OrderPriority Priority { get; set; }
    public string? Status { get; set; }
    public int? MasterId { get; set; }
    public double Cost { get; set; }
    public double Paid { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}