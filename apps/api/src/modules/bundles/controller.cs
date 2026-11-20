namespace Typely.Api.Src.Modules.Bundles;

public static class BundlesController
{
    public static async Task<IResult> Create(
        CreateBundleRequest req,
        BundlesService service,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.Ciphertext) || string.IsNullOrWhiteSpace(req.Iv))
        {
            return Results.BadRequest(new { error = "Ciphertext and Iv are required." });
        }

        if (req.Ciphertext.Length > BundlesSchema.MaxCiphertextLength)
        {
            return Results.BadRequest(new { error = "Payload exceeds maximum allowed size." });
        }

        var created = await service.CreateAsync(req, ct);
        return Results.Created($"/api/bundles/{created.Id}", created);
    }

    public static async Task<IResult> GetById(
        Guid id,
        BundlesService service,
        CancellationToken ct)
    {
        var bundle = await service.GetByIdAsync(id, ct);
        return bundle is null
            ? Results.NotFound(new { error = "Bundle not found." })
            : Results.Ok(bundle);
    }
}
