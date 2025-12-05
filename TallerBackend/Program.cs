using Microsoft.EntityFrameworkCore;
using TallerBackend.Data;
using System.Text.Json.Serialization;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// LOGGING
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// JSON Y CONTROLADORES
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
    });

// BASE DE DATOS
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        new MySqlServerVersion(new Version(8, 0, 21))
    )
);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins("http://100.26.173.76") // frontend en puerto 80
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// SWAGGER
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// SWAGGER UI
app.UseSwagger();
app.UseSwaggerUI();



app.UseRouting();

app.UseCors("AllowFrontend");

app.UseAuthorization();

// ENDPOINTS
app.MapControllers();

app.Run("http://0.0.0.0:5000");
