using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using BookingService.Context;
using RabbitMQ.Client;
using SharedLibrary.Extensions;
using SharedLibrary.Infrastructure;
using System.Text;
using BookingService.Messaging;
using SharedLibrary.Repositories;
using BookingService.Hubs;

var builder = WebApplication.CreateBuilder(args);

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

builder.Services.AddDbContext<BookingContext>(option => option.UseNpgsql(builder.Configuration.GetConnectionString("Database")));

builder.Services.AddControllers();

builder.Services.AddHostedService<BookingConsumer>();

builder.Services.AddSignalR();

builder.Services.AddControllers()
    .AddJsonOptions(options => {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

builder.Services.AddScoped<DbContext, BookingContext>();
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddSingleton<IConnectionFactory>(new ConnectionFactory
{
    HostName = "localhost",
    UserName = "user",
    Password = "password",
    VirtualHost = "/"
});

builder.Services.AddSingleton<IMessageProducer>(sp =>
{
    var factory = sp.GetRequiredService<IConnectionFactory>();
    return MessageProducer.CreateAsync(factory).GetAwaiter().GetResult();
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuers = [builder.Configuration["JwtSettings:Issuer"] ?? string.Empty],
            ValidAudience = builder.Configuration["JwtSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Secret"]!))
        };
    });
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:4200").AllowAnyMethod().AllowAnyHeader().AllowCredentials();
    });
});

builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer<BearerSecuritySchemeTransformer>();
});

builder.Services.AddHttpContextAccessor();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapScalarWithAuth();
    app.ApplyMigrations<BookingContext>();
}

app.UseCors("CorsPolicy");

app.MapHub<BookingHub>("/hubs/bookings");

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
