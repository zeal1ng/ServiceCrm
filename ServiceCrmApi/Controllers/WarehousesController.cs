using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ServiceCrmApi.Models;
using ServiceCrmApi.DTOs;
using ServiceCrmApi.Services;
using System.Security.Claims;

namespace ServiceCrmApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WarehousesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ActivityLogService _log;

    public WarehousesController(AppDbContext context, ActivityLogService log)
    {
        _context = context;
        _log = log;
    }

    private string? GetCurrentUserName() => User.FindFirst(ClaimTypes.Name)?.Value;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<WarehouseDto>>> GetWarehouses()
    {
        var warehouses = await _context.Warehouses
            .Include(w => w.User)
            .Select(w => new WarehouseDto
            {
                Id = w.Id,
                Name = w.Name,
                Address = w.Address,
                UserId = w.UserId,
                ManagerName = w.User != null ? w.User.Name : null
            })
            .ToListAsync();

        return Ok(warehouses);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<WarehouseDto>> GetWarehouse(int id)
    {
        var warehouse = await _context.Warehouses
            .Include(w => w.User)
            .Select(w => new WarehouseDto
            {
                Id = w.Id,
                Name = w.Name,
                Address = w.Address,
                UserId = w.UserId,
                ManagerName = w.User != null ? w.User.Name : null
            })
            .FirstOrDefaultAsync(w => w.Id == id);

        if (warehouse == null) return NotFound();

        return Ok(warehouse);
    }

    [HttpPost]
    [Authorize(Roles = "Master,Admin")]
    public async Task<ActionResult<WarehouseDto>> CreateWarehouse(CreateWarehouseDto dto)
    {
        var warehouse = new Warehouse
        {
            Name = dto.Name,
            Address = dto.Address,
            UserId = dto.UserId
        };

        _context.Warehouses.Add(warehouse);
        await _context.SaveChangesAsync();

        await _log.LogAsync(null, GetCurrentUserName(), "Create", "Warehouse", warehouse.Id, $"Создан склад: {warehouse.Name}");

        var resultDto = new WarehouseDto
        {
            Id = warehouse.Id,
            Name = warehouse.Name,
            Address = warehouse.Address,
            UserId = warehouse.UserId
        };

        return CreatedAtAction(nameof(GetWarehouse), new { id = warehouse.Id }, resultDto);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Master,Admin")]
    public async Task<IActionResult> UpdateWarehouse(int id, UpdateWarehouseDto dto)
    {
        var warehouse = await _context.Warehouses.FindAsync(id);
        if (warehouse == null) return NotFound();

        warehouse.Name = dto.Name;
        warehouse.Address = dto.Address;
        warehouse.UserId = dto.UserId;

        await _context.SaveChangesAsync();

        await _log.LogAsync(null, GetCurrentUserName(), "Update", "Warehouse", id, $"Обновлён склад: {warehouse.Name}");

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Master,Admin")]
    public async Task<IActionResult> DeleteWarehouse(int id)
    {
        var warehouse = await _context.Warehouses.FindAsync(id);
        if (warehouse == null) return NotFound();

        var name = warehouse.Name;
        _context.Warehouses.Remove(warehouse);
        await _context.SaveChangesAsync();

        await _log.LogAsync(null, GetCurrentUserName(), "Delete", "Warehouse", id, $"Удалён склад: {name}");

        return NoContent();
    }
}
