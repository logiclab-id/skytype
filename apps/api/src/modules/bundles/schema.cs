namespace Skytype.Api.Src.Modules.Bundles;

public static class BundlesSchema
{
    public const int MaxCiphertextLength = 500_000;
    public const int DefaultMaxReaders = 3;
    public const int MaxAllowedReaders = 100;
}

public record CreateBundleRequest(
    string Ciphertext,
    string Iv,
    int? MaxReaders = null
);

public record CreateBundleResponse(Guid Id);

public record BundleResponse(
    Guid Id,
    string Ciphertext,
    string Iv,
    DateTimeOffset CreatedAt,
    int ReadersUsed,
    int MaxReaders
);

public enum BundleReadStatus
{
    Found,
    NotFound,
    ReaderLimitReached,
}

public record BundleReadResult(
    BundleReadStatus Status,
    BundleResponse? Bundle = null,
    int? MaxReaders = null
);
