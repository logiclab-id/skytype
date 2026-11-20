using Microsoft.EntityFrameworkCore;
using Typely.Api.Src.Db;

namespace Typely.Api.Src.Utils;

public sealed class ExpiredBundlesCleanupService(
    IServiceScopeFactory scopeFactory,
    ILogger<ExpiredBundlesCleanupService> logger) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromHours(1);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await CleanupAsync(stoppingToken);

        using var timer = new PeriodicTimer(Interval);
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            await CleanupAsync(stoppingToken);
        }
    }

    private async Task CleanupAsync(CancellationToken ct)
    {
        try
        {
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var now = DateTimeOffset.UtcNow;

            var deleted = await db.Bundles
                .Where(b => b.ExpiresAt != null && b.ExpiresAt <= now)
                .ExecuteDeleteAsync(ct);

            if (deleted > 0)
            {
                logger.LogInformation("Removed {Count} expired bundle(s).", deleted);
            }
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to clean up expired bundles.");
        }
    }
}
