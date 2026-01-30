using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DevNest.Migrations
{
    /// <inheritdoc />
    public partial class AddedLogoUrlToTech : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Techs_Images_LogoImageId",
                table: "Techs");

            migrationBuilder.DropIndex(
                name: "IX_Techs_LogoImageId",
                table: "Techs");

            migrationBuilder.DropColumn(
                name: "LogoImageId",
                table: "Techs");

            migrationBuilder.AddColumn<string>(
                name: "LogoUrl",
                table: "Techs",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LogoUrl",
                table: "Techs");

            migrationBuilder.AddColumn<int>(
                name: "LogoImageId",
                table: "Techs",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Techs_LogoImageId",
                table: "Techs",
                column: "LogoImageId");

            migrationBuilder.AddForeignKey(
                name: "FK_Techs_Images_LogoImageId",
                table: "Techs",
                column: "LogoImageId",
                principalTable: "Images",
                principalColumn: "Id");
        }
    }
}
