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
public class TransactionsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ActivityLogService _log;

    public TransactionsController(AppDbContext context, ActivityLogService log)
    {
        _context = context;
        _log = log;
    }

    private string? GetCurrentUserName() => User.FindFirst(ClaimTypes.Name)?.Value;

    // GET: api/Transactions?orderId=5
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TransactionDto>>> GetTransactions([FromQuery] int? orderId)
    {
        var query = _context.Transactions.AsQueryable();

        if (orderId.HasValue)
        {
            query = query.Where(t => t.OrderId == orderId.Value);
        }

        var transactions = await query
            .Select(t => new TransactionDto
            {
                Id = t.Id,
                Type = t.Type.ToString(),
                Amount = t.Amount,
                Category = t.Category,
                Description = t.Description,
                OrderId = t.OrderId,
                CreatedAt = t.CreatedAt
            })
            .ToListAsync();

        return Ok(transactions);
    }

    // GET: api/Transactions/5
    [HttpGet("{id}")]
    public async Task<ActionResult<TransactionDto>> GetTransaction(int id)
    {
        var transaction = await _context.Transactions
            .Select(t => new TransactionDto
            {
                Id = t.Id,
                Type = t.Type.ToString(),
                Amount = t.Amount,
                Category = t.Category,
                Description = t.Description,
                OrderId = t.OrderId,
                CreatedAt = t.CreatedAt
            })
            .FirstOrDefaultAsync(t => t.Id == id);

        if (transaction == null) return NotFound();

        return Ok(transaction);
    }

    // POST: api/Transactions
    [HttpPost]
    public async Task<ActionResult<Transaction>> CreateTransaction(CreateTransactionDto dto)
    {
        // 1. Проверяем заказ
        var order = await _context.Orders.FindAsync(dto.OrderId);
        if (order == null) return BadRequest(new { message = "Order not found" });

        // 2. Парсим тип
        if (!Enum.TryParse<TransactionType>(dto.Type, true, out var type))
        {
            type = TransactionType.Income;
        }

        var transaction = new Transaction
        {
            OrderId = dto.OrderId,
            Type = type,
            Amount = dto.Amount,
            Category = dto.Category,
            Description = dto.Description,
            CreatedAt = DateTime.UtcNow
        };

        // 3. Обновляем сумму оплаченного в заказе
        if (type == TransactionType.Income)
        {
            order.Paid += dto.Amount;
        }
        else if (type == TransactionType.Expense)
        {
            order.Paid -= dto.Amount;
            if (order.Paid < 0) order.Paid = 0; // Защита от отрицательной оплаты
        }

        // 4. Меняем статус, если оплачено полностью
        if (order.Paid >= order.Cost && order.Status != "Completed")
        {
            order.Status = "Ready"; 
        }

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();

        var typeLabel = type == TransactionType.Income ? "доход" : "расход";
        await _log.LogAsync(null, GetCurrentUserName(), "Create", "Transaction", transaction.Id, $"Добавлен {typeLabel} на {dto.Amount}₽ по заказу #{dto.OrderId}");

        var resultDto = new TransactionDto
        {
            Id = transaction.Id,
            Type = transaction.Type.ToString(),
            Amount = transaction.Amount,
            Category = transaction.Category,
            Description = transaction.Description,
            OrderId = transaction.OrderId,
            CreatedAt = transaction.CreatedAt
        };

        return CreatedAtAction(nameof(GetTransaction), new { id = transaction.Id }, resultDto);
    }

    // DELETE: api/Transactions/5
    [HttpDelete("{id}")]
    [Authorize(Roles = "Master,Admin")]
    public async Task<IActionResult> DeleteTransaction(int id)
    {
        var transaction = await _context.Transactions.FindAsync(id);
        if (transaction == null) return NotFound();

        // Корректируем заказ
        var order = await _context.Orders.FindAsync(transaction.OrderId);
        if (order != null)
        {
            if (transaction.Type == TransactionType.Income)
            {
                order.Paid -= transaction.Amount;
                if (order.Paid < 0) order.Paid = 0;
            }
            else if (transaction.Type == TransactionType.Expense)
            {
                order.Paid += transaction.Amount;
            }

            // Если после удаления оплата стала меньше стоимости, сбрасываем статус
            if (order.Paid < order.Cost && order.Status == "Ready")
            {
                order.Status = "In Progress";
            }
        }

        _context.Transactions.Remove(transaction);
        await _context.SaveChangesAsync();

        await _log.LogAsync(null, GetCurrentUserName(), "Delete", "Transaction", id, $"Удалена транзакция #{id}");

        return NoContent();
    }
}