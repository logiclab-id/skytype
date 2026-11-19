using System.Collections.Concurrent;
using System.Security.Cryptography;
using Microsoft.AspNetCore.WebUtilities;

namespace Typely.Api.Src.Modules;

public record CreateBundleRequest(string Ciphertext, string Iv);

public record BundleRecord(string Id, string Ciphertext, string Iv, DateTimeOffset CreatedAt);

public static class BundlesModule
{
    private static readonly ConcurrentDictionary<string, BundleRecord> Store = new();

    public static void MapBundleRoutes(this RouteGroupBuilder api)
    {
        var group = api.MapGroup("/bundles");

        group.MapPost("/", (CreateBundleRequest req) =>
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
            var record = new BundleRecord(id, req.Ciphertext, req.Iv, DateTimeOffset.UtcNow);
            Store[id] = record;

            return Results.Created($"/api/bundles/{id}", new { id });
        });

        group.MapGet("/{id}", (string id) =>
        {
            if (!Store.TryGetValue(id, out var record))
            {
                return Results.NotFound(new { error = "Bundle not found." });
            }

            return Results.Ok(new
            {
                id = record.Id,
                ciphertext = record.Ciphertext,
                iv = record.Iv,
                createdAt = record.CreatedAt
            });
        });
    }
}
