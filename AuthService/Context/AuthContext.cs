using AuthService.Entities;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Context
{
    public class AuthContext : DbContext
    {
        public AuthContext() : base() { }
        public AuthContext(DbContextOptions<AuthContext> options) : base(options) { }
        public DbSet<User> Users { get; set; }
    }
}
