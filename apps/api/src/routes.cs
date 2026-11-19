using Typely.Api.Src.Modules;

namespace Typely.Api.Src;

public static class Routes
{
    public static void MapApiRoutes(this WebApplication app)
    {
        var api = app.MapGroup("/api");

        api.MapGet("/health", () => Results.Ok(new
        {
            status = "ok",
            service = "typely-api",
            timestamp = DateTimeOffset.UtcNow
        }));

        api.MapBundleRoutes();
    }
}
