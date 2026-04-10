namespace ServiceCrmApi.Models;

public class Setting
{
    public int Id { get; set; }
    public string KeyName { get; set; } = null!;
    public string? Value { get; set; }
    public string? Description { get; set; }
}