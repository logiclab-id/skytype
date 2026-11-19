using Microsoft.EntityFrameworkCore;

namespace Typely.Api.Src.Db;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Bundle> Bundles => Set<Bundle>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Bundle>(entity =>
        {
            entity.ToTable("bundles");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .HasMaxLength(32)
                .IsRequired();

            entity.Property(e => e.Ciphertext)
                .HasColumnName("ciphertext")
                .IsRequired();

            entity.Property(e => e.Iv)
                .HasColumnName("iv")
                .HasMaxLength(64)
                .IsRequired();

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .IsRequired();

            entity.Property(e => e.ExpiresAt)
                .HasColumnName("expires_at");

            entity.HasIndex(e => e.CreatedAt)
                .HasDatabaseName("ix_bundles_created_at");
        });
    }
}
