using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Skytype.Api.migrations
{
    /// <inheritdoc />
    public partial class AddMaxReadersTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "max_readers",
                table: "bundles",
                type: "integer",
                nullable: false,
                defaultValue: 3);

            migrationBuilder.AddColumn<List<string>>(
                name: "reader_hashes",
                table: "bundles",
                type: "text[]",
                nullable: false,
                defaultValueSql: "'{}'::text[]");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "max_readers",
                table: "bundles");

            migrationBuilder.DropColumn(
                name: "reader_hashes",
                table: "bundles");
        }
    }
}
