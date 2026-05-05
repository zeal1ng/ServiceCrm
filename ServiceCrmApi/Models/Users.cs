using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ServiceCrmApi.Models;

public enum UserRole { Admin, Master, Manager }
public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    [Required, MaxLength(255), Column("password")]
    public string PasswordHash { get; set; } = null!;
    public UserRole Role { get; set; } = UserRole.Manager;
    public string? Specialization { get; set; }
    public int Comission_percent { get; set; } = 10;
    public DateTime CreatedAt { get; set; }
    public List<Order> Orders { get; set; } = new List<Order>();
    public List<Warehouse> Warehouses { get; set; } = new List<Warehouse>();
}