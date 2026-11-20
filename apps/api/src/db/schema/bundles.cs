namespace Skytype.Api.Src.Db.Schema;

public class Bundle
{
    public Guid Id { get; set; }
    public string Ciphertext { get; set; } = string.Empty;
    public string Iv { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? ExpiresAt { get; set; }
}
