namespace Typely.Api.Src.Db;

/// <summary>
/// Database entity representing an opaque E2E-encrypted bundle.
/// </summary>
public class Bundle
{
    public string Id { get; set; } = string.Empty;
    public string Ciphertext { get; set; } = string.Empty;
    public string Iv { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? ExpiresAt { get; set; }
}

public record CreateBundleRequest(string Ciphertext, string Iv);

public record CreateBundleResponse(string Id);

public record BundleResponse(string Id, string Ciphertext, string Iv, DateTimeOffset CreatedAt);
