using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

public class Modelo
{
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Slug { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Model { get; set; } = string.Empty;

    [Required]
    [ForeignKey("Marca")]
    public int IdMarca { get; set; }

    [JsonIgnore]
    public Marca? Marca { get; set; }
}