using System.Text.Json.Serialization;

public class Marca
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;

    [JsonIgnore]  // Evita que se serialicen los modelos al obtener la lista de marcas
    public List<Modelo> Modelos { get; set; } = new();
}
