using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DevNest.Migrations
{
    /// <inheritdoc />
    public partial class AddedTechs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TechId",
                table: "JobTechs",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Techs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    LogoImageId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Techs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Techs_Images_LogoImageId",
                        column: x => x.LogoImageId,
                        principalTable: "Images",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_JobTechs_TechId",
                table: "JobTechs",
                column: "TechId");

            migrationBuilder.CreateIndex(
                name: "IX_Techs_LogoImageId",
                table: "Techs",
                column: "LogoImageId");

            migrationBuilder.AddForeignKey(
                name: "FK_JobTechs_Techs_TechId",
                table: "JobTechs",
                column: "TechId",
                principalTable: "Techs",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JobTechs_Techs_TechId",
                table: "JobTechs");

            migrationBuilder.DropTable(
                name: "Techs");

            migrationBuilder.DropIndex(
                name: "IX_JobTechs_TechId",
                table: "JobTechs");

            migrationBuilder.DropColumn(
                name: "TechId",
                table: "JobTechs");
        }
    }
}
