namespace ServiceCrmApi.DTOs;

public class SettingDto
{
    public int Id { get; set; }
    public string KeyName { get; set; } = string.Empty;
    public string? Value { get; set; }
    public string? Description { get; set; }
}

public class CreateSettingDto
{
    public string KeyName { get; set; } = string.Empty;
    public string? Value { get; set; }
    public string? Description { get; set; }
}

public class UpdateSettingDto
{
    public string? Value { get; set; }
    public string? Description { get; set; }
}
