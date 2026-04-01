using AuthService.Context;
using AuthService.Services;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using SharedLibrary.Extensions;
using SharedLibrary.Repositories;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddDbContext<AuthContext>(option => option.UseNpgsql(builder.Configuration.GetConnectionString("Database")));

builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<DbContext, AuthContext>();
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));

builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:4200").AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
    app.ApplyMigrations<AuthContext>();
}

app.UseCors("CorsPolicy");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
