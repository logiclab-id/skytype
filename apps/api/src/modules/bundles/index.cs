using Skytype.Api.Src.Modules.Bundles;

namespace Skytype.Api.Src.Modules;

public static class BundlesModule
{
    public static IServiceCollection AddBundlesModule(this IServiceCollection services)
    {
        services.AddScoped<BundlesService>();
        return services;
    }

    public static void MapBundleRoutes(this RouteGroupBuilder api)
    {
        var group = api.MapGroup("/bundles");

        group.MapPost("/", BundlesController.Create);
        group.MapGet("/{id:guid}", BundlesController.GetById);
    }
}
