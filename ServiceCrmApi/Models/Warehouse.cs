using Microsoft.AspNetCore.SignalR;
using Microsoft.Net.Http.Headers;

namespace ServiceCrmApi.Models;

public class Warehouse
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Address { get; set; } = null!;
    public int UserId { get; set; }
    public User? User { get; set; }
    public List<Product> Products { get; set; } = new List<Product>();
}
