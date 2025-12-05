namespace TallerBackend.Models
{
    public class Servicio
    {
        public int Id { get; set; }
        public required string Nombre { get; set; }
        public required string Descripcion { get; set; }
        public required string Imagen { get; set; }
        public decimal Precio { get; set; }
    }
}
