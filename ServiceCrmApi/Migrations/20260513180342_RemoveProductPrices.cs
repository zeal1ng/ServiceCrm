using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ServiceCrmApi.Migrations
{
    /// <inheritdoc />
    public partial class RemoveProductPrices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BuyPrice",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "SellPrice",
                table: "Products");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "BuyPrice",
                table: "Products",
                type: "numeric(10,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "SellPrice",
                table: "Products",
                type: "numeric(10,2)",
                nullable: false,
                defaultValue: 0m);
        }
    }
}
