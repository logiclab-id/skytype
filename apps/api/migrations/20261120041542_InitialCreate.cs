using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Skytype.Api.migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "bundles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    ciphertext = table.Column<string>(type: "text", nullable: false),
                    iv = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    expires_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true, defaultValueSql: "NOW() + INTERVAL '1 year'")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_bundles", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_bundles_created_at",
                table: "bundles",
                column: "created_at");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "bundles");
        }
    }
}
