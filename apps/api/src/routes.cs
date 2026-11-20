using Skytype.Api.Src.Modules;

namespace Skytype.Api.Src;

public static class Routes
{
    public static void MapApiRoutes(this WebApplication app)
    {
        var api = app.MapGroup("/api");

        api.MapGet("/health", () => Results.Ok(new
        {
            status = "ok",
            service = "skytype-api",
            timestamp = DateTimeOffset.UtcNow
        }));

        api.MapBundleRoutes();

        app.MapFallbackToFile("index.html");
    }
}
