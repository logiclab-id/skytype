using Microsoft.EntityFrameworkCore;
using Skytype.Api.Src.Db.Schema;

namespace Skytype.Api.Src.Db.Seeders;

public static class BundlesSeeder
{
    private static readonly Guid DemoBundleId = Guid.Parse("00000000-0000-0000-0000-000000000001");

    public static void Seed(AppDbContext db, bool isDevelopment)
    {
        if (!isDevelopment || db.Bundles.AsNoTracking().Any())
        {
            return;
        }

        var now = DateTimeOffset.UtcNow;
        db.Bundles.Add(new Bundle
        {
            Id = DemoBundleId,
            Ciphertext = "opaque-demo-ciphertext",
            Iv = "opaque-demo-iv",
            CreatedAt = now,
            ExpiresAt = now.AddYears(1),
        });

        db.SaveChanges();
    }
}
