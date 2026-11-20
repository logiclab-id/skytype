namespace Skytype.Api.Src.Modules.Bundles;

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

        if (req.MaxReaders is < 1 or > BundlesSchema.MaxAllowedReaders)
        {
            return Results.BadRequest(new { error = $"MaxReaders must be between 1 and {BundlesSchema.MaxAllowedReaders}." });
        }

        var created = await service.CreateAsync(req, ct);
        return Results.Created($"/api/bundles/{created.Id}", created);
    }

    public static async Task<IResult> GetById(
        Guid id,
        HttpContext httpContext,
        BundlesService service,
        CancellationToken ct)
    {
        var headerToken = httpContext.Request.Headers["X-Reader-Token"].FirstOrDefault();
        var readerKey = !string.IsNullOrWhiteSpace(headerToken)
            ? headerToken.Trim()
            : $"{httpContext.Connection.RemoteIpAddress}:{httpContext.Request.Headers.UserAgent}";

        var result = await service.GetByIdAsync(id, readerKey, ct);
        return result.Status switch
        {
            BundleReadStatus.NotFound => Results.NotFound(new { error = "Bundle not found." }),
            BundleReadStatus.ReaderLimitReached => Results.Json(
                new { error = $"Access limit reached: this bundle has already been read by {result.MaxReaders ?? BundlesSchema.DefaultMaxReaders} different users." },
                statusCode: StatusCodes.Status410Gone
            ),
            _ => Results.Ok(result.Bundle),
        };
    }
}
