using Microsoft.EntityFrameworkCore;
using Typely.Api.Src.Db;
using Typely.Api.Src.Db.Schema;

namespace Typely.Api.Src.Modules.Bundles;

public sealed class BundlesService(AppDbContext db)
{
    public async Task<CreateBundleResponse> CreateAsync(CreateBundleRequest req, CancellationToken ct)
    {
        var now = DateTimeOffset.UtcNow;
        var bundle = new Bundle
        {
            Id = Guid.NewGuid(),
            Ciphertext = req.Ciphertext,
            Iv = req.Iv,
            CreatedAt = now,
            ExpiresAt = now.AddYears(1),
        };

        db.Bundles.Add(bundle);
        await db.SaveChangesAsync(ct);

        return new CreateBundleResponse(bundle.Id);
    }

    public async Task<BundleResponse?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var bundle = await db.Bundles
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == id, ct);

        if (bundle is null || (bundle.ExpiresAt.HasValue && bundle.ExpiresAt <= DateTimeOffset.UtcNow))
        {
            return null;
        }

        return new BundleResponse(
            bundle.Id,
            bundle.Ciphertext,
            bundle.Iv,
            bundle.CreatedAt
        );
    }
}
