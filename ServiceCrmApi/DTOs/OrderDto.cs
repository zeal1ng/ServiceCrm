namespace ServiceCrmApi.DTOs;

public class OrderDto
{
    public int Id { get; set; }
    public string? Device { get; set; }
    public string? Serial { get; set; }
    public string? Issue { get; set; }
    public string? Diagnosis { get; set; }
    public string Priority { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal Cost { get; set; }
    public decimal Paid { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    
    // Только ID и имя клиента, НЕ весь объект Client со списком заказов
    public int ClientId { get; set; }
    public string? ClientName { get; set; }
    
    public int? UserId { get; set; }
    public string? ExecutorName { get; set; }
}

public class CreateOrderDto
{
    public int ClientId { get; set; }
    public string? Device { get; set; }
    public string? Serial { get; set; }
    public string? Issue { get; set; }
    public string Priority { get; set; } = "Normal";
    public decimal Cost { get; set; }
    public string? Comment { get; set; }
}

public class UpdateOrderDto
{
    public string? Device { get; set; }
    public string? Serial { get; set; }
    public string? Issue { get; set; }
    public string? Diagnosis { get; set; }
    public string Priority { get; set; }
    public string Status { get; set; }
    public decimal Cost { get; set; }
    public decimal Paid { get; set; }
    public int? ClientId { get; set; }
}