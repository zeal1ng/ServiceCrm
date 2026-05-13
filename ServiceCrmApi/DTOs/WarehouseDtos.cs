namespace ServiceCrmApi.DTOs;

public class WarehouseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public int UserId { get; set; }
    public string? ManagerName { get; set; }
}

public class CreateWarehouseDto
{
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public int UserId { get; set; }
}

public class UpdateWarehouseDto
{
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public int UserId { get; set; }
}
