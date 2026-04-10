namespace ServiceCrmApi.Models;

public enum UserRole
{
    Admin,
    Master
}
public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string Password { get; set; } = null!;
    public UserRole Role { get; set; }
    public string? Specialization { get; set; }
    public double Comission_percent { get; set; }
    public DateTime CreatedAt { get; set; }
}