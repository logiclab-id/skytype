using Microsoft.EntityFrameworkCore;
using Npgsql;
using Skytype.Api.Src.Db.Seeders;

namespace Skytype.Api.Src.Db;

public static class DatabaseSetup
{
    public static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration configuration)
    {
        var rawUrl = configuration["WORKSPACE_DATABASE_URL"]
            ?? Environment.GetEnvironmentVariable("WORKSPACE_DATABASE_URL")
            ?? ReadEnvValue("WORKSPACE_DATABASE_URL");

        var connectionString = !string.IsNullOrWhiteSpace(rawUrl)
            ? ConvertDatabaseUrl(rawUrl)
            : configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Database connection string is not configured.");

        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString));

        return services;
    }

    public static void InitializeDatabase(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.Migrate();
        DbSeeder.Seed(db, app.Environment.IsDevelopment());
    }

    private static string ConvertDatabaseUrl(string databaseUrl)
    {
        if (!databaseUrl.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) &&
            !databaseUrl.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            return databaseUrl;
        }

        var uri = new Uri(databaseUrl);
        var userInfo = uri.UserInfo.Split(':', 2);
        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.Port > 0 ? uri.Port : 5432,
            Database = uri.AbsolutePath.TrimStart('/'),
            Username = Uri.UnescapeDataString(userInfo[0]),
            Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty,
        };

        return builder.ConnectionString;
    }

    private static string? ReadEnvValue(string key)
    {
        var dir = new DirectoryInfo(Directory.GetCurrentDirectory());
        while (dir is not null)
        {
            var envPath = Path.Combine(dir.FullName, ".env");
            if (File.Exists(envPath))
            {
                foreach (var line in File.ReadLines(envPath))
                {
                    var trimmed = line.Trim();
                    if (string.IsNullOrEmpty(trimmed) || trimmed.StartsWith('#'))
                    {
                        continue;
                    }

                    var idx = trimmed.IndexOf('=');
                    if (idx <= 0)
                    {
                        continue;
                    }

                    var k = trimmed[..idx].Trim();
                    if (string.Equals(k, key, StringComparison.Ordinal))
                    {
                        return trimmed[(idx + 1)..].Trim().Trim('"', '\'');
                    }
                }
            }

            dir = dir.Parent;
        }

        return null;
    }
}
