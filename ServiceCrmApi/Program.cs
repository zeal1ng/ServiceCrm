using Microsoft.EntityFrameworkCore;
using ServiceCrmApi.Models;
using ServiceCrmApi.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var KEY = jwtSettings["Key"];
var ISSUER = jwtSettings["Issuer"];
var AUDIENCE = jwtSettings["Audience"];

if (string.IsNullOrEmpty(KEY) || string.IsNullOrEmpty(ISSUER) || string.IsNullOrEmpty(AUDIENCE))
{
    throw new InvalidOperationException("JWT settings not configured. Check user-secrets.");
}




