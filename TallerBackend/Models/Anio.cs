using System.ComponentModel.DataAnnotations.Schema;

public class Anio
{
    public int Id { get; set; }
    public int Year { get; set; }

    [ForeignKey("Modelo")]
    public int IdModel { get; set; }   // Coincide con la columna en MySQL
    public Modelo Modelo { get; set; } = null!;
}
