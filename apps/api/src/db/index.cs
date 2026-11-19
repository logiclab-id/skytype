namespace Typely.Api.Src.Db;

public static class DatabaseSetup
{
    public static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration configuration)
    {
        // Register AppDbContext / database services here when ready.
        services.AddScoped<AppDbContext>();
        return services;
    }
}
