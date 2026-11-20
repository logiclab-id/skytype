using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Skytype.Api.Src.Db;
using Skytype.Api.Src.Db.Schema;

namespace Skytype.Api.Src.Modules.Bundles;

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
            MaxReaders = req.MaxReaders ?? BundlesSchema.DefaultMaxReaders,
            ReaderHashes = [],
        };

        db.Bundles.Add(bundle);
        await db.SaveChangesAsync(ct);

        return new CreateBundleResponse(bundle.Id);
    }

    public async Task<BundleReadResult> GetByIdAsync(Guid id, string readerKey, CancellationToken ct)
    {
        var bundle = await db.Bundles
            .FirstOrDefaultAsync(b => b.Id == id, ct);

        if (bundle is null || (bundle.ExpiresAt.HasValue && bundle.ExpiresAt <= DateTimeOffset.UtcNow))
        {
            return new BundleReadResult(BundleReadStatus.NotFound);
        }

        var readerHash = ComputeReaderHash(id, readerKey);
        if (!bundle.ReaderHashes.Contains(readerHash))
        {
            if (bundle.ReaderHashes.Count >= bundle.MaxReaders)
            {
                return new BundleReadResult(BundleReadStatus.ReaderLimitReached, MaxReaders: bundle.MaxReaders);
            }

            bundle.ReaderHashes = [.. bundle.ReaderHashes, readerHash];
            await db.SaveChangesAsync(ct);
        }

        return new BundleReadResult(
            BundleReadStatus.Found,
            new BundleResponse(
                bundle.Id,
                bundle.Ciphertext,
                bundle.Iv,
                bundle.CreatedAt,
                bundle.ReaderHashes.Count,
                bundle.MaxReaders
            )
        );
    }

    private static string ComputeReaderHash(Guid bundleId, string readerKey)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes($"{bundleId:N}:{readerKey}"));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
