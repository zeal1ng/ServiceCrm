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
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ActivityLogService _log;

    public ProductsController(AppDbContext context, ActivityLogService log)
    {
        _context = context;
        _log = log;
    }

    private string? GetCurrentUserName() => User.FindFirst(ClaimTypes.Name)?.Value;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts([FromQuery] int? warehouseId)
    {
        var query = _context.Products.Include(p => p.Warehouse).AsQueryable();

        if (warehouseId.HasValue)
            query = query.Where(p => p.WarehouseId == warehouseId.Value);

        var products = await query
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Quantity = p.Quantity,
                WarehouseId = p.WarehouseId,
                WarehouseName = p.Warehouse != null ? p.Warehouse.Name : null
            })
            .ToListAsync();

        return Ok(products);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetProduct(int id)
    {
        var product = await _context.Products
            .Include(p => p.Warehouse)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Quantity = p.Quantity,
                WarehouseId = p.WarehouseId,
                WarehouseName = p.Warehouse != null ? p.Warehouse.Name : null
            })
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null) return NotFound();

        return Ok(product);
    }

    [HttpPost]
    [Authorize(Roles = "Master,Admin")]
    public async Task<ActionResult<ProductDto>> CreateProduct(CreateProductDto dto)
    {
        var product = new Product
        {
            Name = dto.Name,
            Quantity = dto.Quantity,
            WarehouseId = dto.WarehouseId
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        await _log.LogAsync(null, GetCurrentUserName(), "Create", "Product", product.Id, $"Создан товар: {product.Name}");

        var resultDto = new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Quantity = product.Quantity,
            WarehouseId = product.WarehouseId
        };

        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, resultDto);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Master,Admin")]
    public async Task<IActionResult> UpdateProduct(int id, UpdateProductDto dto)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound();

        product.Name = dto.Name;
        product.Quantity = dto.Quantity;
        product.WarehouseId = dto.WarehouseId;

        await _context.SaveChangesAsync();

        await _log.LogAsync(null, GetCurrentUserName(), "Update", "Product", id, $"Обновлён товар: {product.Name}");

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Master,Admin")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound();

        var name = product.Name;
        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        await _log.LogAsync(null, GetCurrentUserName(), "Delete", "Product", id, $"Удалён товар: {name}");

        return NoContent();
    }
}
