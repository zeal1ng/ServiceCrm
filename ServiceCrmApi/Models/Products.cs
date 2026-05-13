using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace ServiceCrmApi.Models;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public int Quantity { get; set; }
    public int? WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }
}