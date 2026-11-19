using System.Security.Cryptography;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Typely.Api.Src.Db;

namespace Typely.Api.Src.Modules;

public static class BundlesModule
{
    public static void MapBundleRoutes(this RouteGroupBuilder api)
    {
        var group = api.MapGroup("/bundles");

        group.MapPost("/", async (CreateBundleRequest req, AppDbContext db, CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(req.Ciphertext) || string.IsNullOrWhiteSpace(req.Iv))
            {
                return Results.BadRequest(new { error = "Ciphertext and Iv are required." });
            }

            if (req.Ciphertext.Length > 500_000)
            {
                return Results.BadRequest(new { error = "Payload exceeds maximum allowed size." });
            }

            var id = WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(9));
            var bundle = new Bundle
            {
                Id = id,
                Ciphertext = req.Ciphertext,
                Iv = req.Iv,
                CreatedAt = DateTimeOffset.UtcNow,
            };

            db.Bundles.Add(bundle);
            await db.SaveChangesAsync(ct);

            return Results.Created($"/api/bundles/{id}", new CreateBundleResponse(id));
        });

        group.MapGet("/{id}", async (string id, AppDbContext db, CancellationToken ct) =>
        {
            var bundle = await db.Bundles
                .AsNoTracking()
                .FirstOrDefaultAsync(b => b.Id == id, ct);

            if (bundle is null || (bundle.ExpiresAt.HasValue && bundle.ExpiresAt <= DateTimeOffset.UtcNow))
            {
                return Results.NotFound(new { error = "Bundle not found." });
            }

            return Results.Ok(new BundleResponse(
                bundle.Id,
                bundle.Ciphertext,
                bundle.Iv,
                bundle.CreatedAt
            ));
        });
    }
}
