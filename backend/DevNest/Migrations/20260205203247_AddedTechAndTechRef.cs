using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DevNest.Migrations
{
    /// <inheritdoc />
    public partial class AddedTechAndTechRef : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JobTechs_Techs_TechId",
                table: "JobTechs");

            migrationBuilder.AlterColumn<int>(
                name: "TechId",
                table: "JobTechs",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

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

            migrationBuilder.AlterColumn<int>(
                name: "TechId",
                table: "JobTechs",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_JobTechs_Techs_TechId",
                table: "JobTechs",
                column: "TechId",
                principalTable: "Techs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
