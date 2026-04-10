namespace ServiceCrmApi.Models;

public enum TransactionType
{
    Income,
    Expense
}
public class Transaction
{
    public int Id { get; set; }
    public TransactionType Type { get; set; }
    public double Amount { get; set; }
    public string? Category { get; set; }
    public int OrderId { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
}