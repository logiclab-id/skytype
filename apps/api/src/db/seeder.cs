using Microsoft.EntityFrameworkCore;

namespace Typely.Api.Src.Db;

public static class DbSeeder
{
    /// <summary>
    /// Seeds an initial opaque demo record in Development if the database is empty.
    /// No plaintext or decryption keys are ever stored.
    /// </summary>
    public static void Seed(AppDbContext db, bool isDevelopment)
    {
        if (!isDevelopment || db.Bundles.AsNoTracking().Any())
        {
            return;
        }

        db.Bundles.Add(new Bundle
        {
            Id = "demo-bundle",
            Ciphertext = "opaque-demo-ciphertext",
            Iv = "opaque-demo-iv",
            CreatedAt = DateTimeOffset.UtcNow,
        });

        db.SaveChanges();
    }
}
