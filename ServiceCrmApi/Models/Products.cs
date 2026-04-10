namespace ServiceCrmApi.Models;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public double BuyPrice { get; set; }
    public double SellPrice { get; set; }
    public int Quantity { get; set; }
    public int? WarehouseId { get; set; }
}