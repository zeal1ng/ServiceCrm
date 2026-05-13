namespace ServiceCrmApi.DTOs;

public class CreatePublicOrderDto
{
    public string ClientName { get; set; } = string.Empty;
    public string ClientPhone { get; set; } = string.Empty;
    public string? Device { get; set; }
    public string? Serial { get; set; }
    public string? Issue { get; set; }
}
