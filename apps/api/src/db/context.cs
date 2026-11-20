using Microsoft.EntityFrameworkCore;
using Skytype.Api.Src.Db.Schema;

namespace Skytype.Api.Src.Db;

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
                .HasColumnType("uuid")
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
                .HasColumnName("expires_at")
                .HasDefaultValueSql("NOW() + INTERVAL '1 year'");

            entity.Property(e => e.MaxReaders)
                .HasColumnName("max_readers")
                .HasDefaultValue(3)
                .IsRequired();

            entity.Property(e => e.ReaderHashes)
                .HasColumnName("reader_hashes")
                .HasColumnType("text[]")
                .HasDefaultValueSql("'{}'::text[]")
                .IsRequired();

            entity.HasIndex(e => e.CreatedAt)
                .HasDatabaseName("ix_bundles_created_at");
        });
    }
}
