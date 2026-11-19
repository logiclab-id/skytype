using Typely.Api.Src.Db;

namespace Typely.Api.Src;

public static class AppSetup
{
    public const string CorsPolicyName = "FrontendCors";

    public static void ConfigureServices(this WebApplicationBuilder builder)
    {
        var allowedOrigins = builder.Configuration
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>() ?? ["http://localhost:5173"];

        builder.Services.AddCors(options =>
        {
            options.AddPolicy(CorsPolicyName, policy =>
            {
                policy.WithOrigins(allowedOrigins)
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            });
        });

        builder.Services.AddDatabase(builder.Configuration);
    }

    public static void ConfigureMiddleware(this WebApplication app)
    {
        app.UseCors(CorsPolicyName);
    }
}
