using Microsoft.AspNetCore.Builder;
using Scalar.AspNetCore;

namespace SharedLibrary.Extensions
{
    public static class ScalarExtension
    {
        public static void MapScalarWithAuth(this WebApplication app) 
        {
            app.MapOpenApi();
            app.MapScalarApiReference(options =>
            {
                options.AddPreferredSecuritySchemes("Bearer").AddHttpAuthentication("Bearer", auth => 
                {
                    auth.Token = "";
                }).EnablePersistentAuthentication();
            });
        }
    }
}
