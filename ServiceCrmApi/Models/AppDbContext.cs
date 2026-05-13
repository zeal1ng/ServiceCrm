using System.ComponentModel;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace ServiceCrmApi.Models;

public class AppDbContext : DbContext
{
    public DbSet<Client> Clients { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Setting> Settings { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Warehouse> Warehouses { get; set; }
    public DbSet<ActivityLog> ActivityLogs { get; set; }

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Order>().Property(o => o.Priority)
            .HasConversion<string>()
            .HasDefaultValue(OrderPriority.Normal);
            base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Transaction>().Property(t => t.Type)
            .HasConversion<string>()
            .HasDefaultValue(TransactionType.Income);

        modelBuilder.Entity<User>().Property(u => u.Role)
            .HasConversion<string>()
            .HasDefaultValue(null);

        modelBuilder.Entity<Order>()
            .HasOne(o => o.Client)
            .WithMany(c => c.Orders)
            .HasForeignKey(o => o.ClientId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Order>()
            .HasOne(o => o.User)
            .WithMany(u => u.Orders)
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.SetNull);
        
        modelBuilder.Entity<Warehouse>()
            .HasOne(w => w.User)
            .WithMany(u => u.Warehouses)
            .HasForeignKey(w => w.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Product>()
            .HasOne(p => p.Warehouse)
            .WithMany(w => w.Products)
            .HasForeignKey(p => p.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.Order)
            .WithMany(o => o.Transactions)
            .HasForeignKey(t => t.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}