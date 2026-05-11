namespace ServiceCrmApi.DTOs;

public class TransactionDto
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty; // "Income" или "Expense"
    public decimal Amount { get; set; }
    public string? Category { get; set; }
    public string? Description { get; set; }
    public int OrderId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateTransactionDto
{
    public int OrderId { get; set; }
    public string Type { get; set; } = "Income";
    public decimal Amount { get; set; }
    public string? Category { get; set; }
    public string? Description { get; set; }
}