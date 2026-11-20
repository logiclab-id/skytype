namespace Skytype.Api.Src.Db.Seeders;

public static class DbSeeder
{
    public static void Seed(AppDbContext db, bool isDevelopment)
    {
        BundlesSeeder.Seed(db, isDevelopment);
    }
}
