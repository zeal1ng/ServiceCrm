using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ServiceCrmApi.Models;
using ServiceCrmApi.DTOs;

namespace ServiceCrmApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PublicController : ControllerBase
{
    private readonly AppDbContext _context;

    public PublicController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("order")]
    public async Task<ActionResult> CreateOrder([FromBody] CreatePublicOrderDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.ClientName) || string.IsNullOrWhiteSpace(dto.ClientPhone))
            return BadRequest(new { message = "Имя и телефон клиента обязательны" });

        var client = await _context.Clients.FirstOrDefaultAsync(c => c.Phone == dto.ClientPhone);
        if (client == null)
        {
            client = new Client
            {
                Name = dto.ClientName,
                Phone = dto.ClientPhone,
                CreatedAt = DateTime.UtcNow
            };
            _context.Clients.Add(client);
            await _context.SaveChangesAsync();
        }

        var order = new Order
        {
            ClientId = client.Id,
            Device = dto.Device,
            Serial = dto.Serial,
            Issue = dto.Issue,
            Status = "New",
            Priority = OrderPriority.Normal,
            CreatedAt = DateTime.UtcNow
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Заказ принят", orderId = order.Id });
    }
}
