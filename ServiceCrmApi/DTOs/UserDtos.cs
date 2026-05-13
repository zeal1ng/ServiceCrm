namespace ServiceCrmApi.DTOs;

public class UserDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string Role { get; set; } = string.Empty;
    public string? Specialization { get; set; }
    public int Comission_percent { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateUserDto
{
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = "Manager";
    public string? Specialization { get; set; }
    public int Comission_percent { get; set; } = 10;
}

public class UpdateUserDto
{
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string Role { get; set; } = "Manager";
    public string? Specialization { get; set; }
    public int Comission_percent { get; set; }
}
