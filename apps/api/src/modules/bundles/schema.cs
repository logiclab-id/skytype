namespace Typely.Api.Src.Modules.Bundles;

public static class BundlesSchema
{
    public const int MaxCiphertextLength = 500_000;
}

public record CreateBundleRequest(string Ciphertext, string Iv);

public record CreateBundleResponse(Guid Id);

public record BundleResponse(Guid Id, string Ciphertext, string Iv, DateTimeOffset CreatedAt);
