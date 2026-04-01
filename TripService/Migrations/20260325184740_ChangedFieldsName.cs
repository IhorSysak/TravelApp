using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TripService.Migrations
{
    /// <inheritdoc />
    public partial class ChangedFieldsName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Price",
                table: "Trips",
                newName: "PricePerSeat");

            migrationBuilder.RenameColumn(
                name: "Origin",
                table: "Trips",
                newName: "To");

            migrationBuilder.RenameColumn(
                name: "Destination",
                table: "Trips",
                newName: "From");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "To",
                table: "Trips",
                newName: "Origin");

            migrationBuilder.RenameColumn(
                name: "PricePerSeat",
                table: "Trips",
                newName: "Price");

            migrationBuilder.RenameColumn(
                name: "From",
                table: "Trips",
                newName: "Destination");
        }
    }
}
