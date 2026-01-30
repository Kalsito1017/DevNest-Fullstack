using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DevNest.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkshops : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Workshops",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(240)", maxLength: 240, nullable: false),
                    SourceUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    DateRangeText = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    LastSeenAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Workshops", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WorkshopLecturers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WorkshopId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(140)", maxLength: 140, nullable: false),
                    Occupation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    PhotoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkshopLecturers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkshopLecturers_Workshops_WorkshopId",
                        column: x => x.WorkshopId,
                        principalTable: "Workshops",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WorkshopLecturers_WorkshopId",
                table: "WorkshopLecturers",
                column: "WorkshopId");

            migrationBuilder.CreateIndex(
                name: "IX_Workshops_SourceUrl",
                table: "Workshops",
                column: "SourceUrl",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WorkshopLecturers");

            migrationBuilder.DropTable(
                name: "Workshops");
        }
    }
}
