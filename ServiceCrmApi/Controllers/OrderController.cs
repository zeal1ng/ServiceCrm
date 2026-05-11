using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ServiceCrmApi.Models;
using ServiceCrmApi.DTOs;
using System.Security.Claims;

namespace ServiceCrmApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;

    public OrdersController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/Orders
    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrderDto>>> GetOrders()
    {
        var orders = await _context.Orders
            .Include(o => o.Client)
            .Include(o => o.User)
            .Select(o => new OrderDto
            {
                Id = o.Id,
                Device = o.Device,
                Serial = o.Serial,
                Issue = o.Issue,
                Diagnosis = o.Diagnosis,
                Priority = o.Priority.ToString(),
                Status = o.Status ?? "New",
                Cost = o.Cost,
                Paid = o.Paid,
                CreatedAt = o.CreatedAt,
                ClientId = o.ClientId,
                ClientName = o.Client != null ? o.Client.Name : "Unknown",
                UserId = o.UserId,
                ExecutorName = o.User != null ? o.User.Name : null
            })
            .ToListAsync();

        return Ok(orders);
    }

    // GET: api/Orders/5
    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDto>> GetOrder(int id)
    {
        var order = await _context.Orders
            .Include(o => o.Client)
            .Include(o => o.User)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return NotFound();

        return Ok(new OrderDto
        {
            Id = order.Id,
            Device = order.Device,
            Serial = order.Serial,
            Issue = order.Issue,
            Diagnosis = order.Diagnosis,
            Priority = order.Priority.ToString(),
            Status = order.Status ?? "New",
            Cost = order.Cost,
            Paid = order.Paid,
            CreatedAt = order.CreatedAt,
            ClientId = order.ClientId,
            ClientName = order.Client != null ? order.Client.Name : "Unknown",
            UserId = order.UserId,
            ExecutorName = order.User != null ? order.User.Name : null
        });
    }

    // POST: api/Orders
    [HttpPost]
    public async Task<ActionResult<Order>> CreateOrder(CreateOrderDto dto)
    {
        // 1. Проверяем клиента
        var client = await _context.Clients.FindAsync(dto.ClientId);
        if (client == null) return BadRequest("Client not found");

        // 2. Ищем текущего пользователя для назначения исполнителем
        int? executorId = null;
        var userName = User.FindFirst(ClaimTypes.Name)?.Value;
        
        if (!string.IsNullOrEmpty(userName))
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Name == userName);
            if (user != null) executorId = user.Id;
        }

        // Парсим приоритет
        if (!Enum.TryParse<OrderPriority>(dto.Priority, true, out var priority))
        {
            priority = OrderPriority.Normal;
        }

        var order = new Order
        {
            ClientId = dto.ClientId,
            Device = dto.Device,
            Serial = dto.Serial,
            Issue = dto.Issue,
            Priority = priority,
            Cost = dto.Cost,
            Status = "New",
            UserId = executorId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        // Возвращаем полный объект с данными о клиенте и исполнителе
        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
    }

    // PUT: api/Orders/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateOrder(int id, UpdateOrderDto dto)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) return NotFound();

        order.Device = dto.Device;
        order.Serial = dto.Serial;
        order.Issue = dto.Issue;
        order.Diagnosis = dto.Diagnosis;
        order.Cost = dto.Cost;
        order.Paid = dto.Paid;
        
        if (Enum.TryParse<OrderPriority>(dto.Priority, true, out var p))
            order.Priority = p;
            
        order.Status = dto.Status;

        if (dto.ClientId.HasValue && dto.ClientId.Value != order.ClientId)
        {
            var client = await _context.Clients.FindAsync(dto.ClientId.Value);
            if (client == null) return BadRequest("Client not found");
            order.ClientId = dto.ClientId.Value;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/Orders/5
    [HttpDelete("{id}")]
    [Authorize(Roles = "Master,Admin")]
    public async Task<IActionResult> DeleteOrder(int id)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) return NotFound();

        _context.Orders.Remove(order);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}