using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ServiceCrmApi.Models;
using ServiceCrmApi.DTOs;

namespace ServiceCrmApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClientsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ClientsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ClientDto>>> GetClients()
    {
        var clients = await _context.Clients
            .Select(c => new ClientDto
            {
                Id = c.Id,
                Name = c.Name,
                Phone = c.Phone,
                Email = c.Email,
                Comment = c.Comment,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        return Ok(clients);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ClientDto>> GetClient(int id)
    {
        var client = await _context.Clients.FindAsync(id);

        if (client == null) return NotFound();

        return Ok(new ClientDto 
        { 
            Id = client.Id, 
            Name = client.Name, 
            Phone = client.Phone, 
            Email = client.Email, 
            Comment = client.Comment,
            CreatedAt = client.CreatedAt
        });
    }

    [HttpPost]
    [Authorize(Roles = "Master,Admin")] 
    public async Task<ActionResult<Client>> CreateClient(CreateClientDto dto)
    {
        var client = new Client
        {
            Name = dto.Name,
            Phone = dto.Phone,
            Email = dto.Email,
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow
        };

        _context.Clients.Add(client);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetClient), new { id = client.Id }, client);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Master,Admin")]
    public async Task<IActionResult> UpdateClient(int id, UpdateClientDto dto)
    {
        var client = await _context.Clients.FindAsync(id);
        if (client == null) return NotFound();

        client.Name = dto.Name;
        client.Phone = dto.Phone;
        client.Email = dto.Email;
        client.Comment = dto.Comment;
        // CreatedAt не меняем

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Master,Admin")]
    public async Task<IActionResult> DeleteClient(int id)
    {
        var client = await _context.Clients.FindAsync(id);
        if (client == null) return NotFound();

        _context.Clients.Remove(client);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}