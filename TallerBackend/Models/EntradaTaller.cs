using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TallerBackend.Models
{
    public class EntradaTaller
    {
        [Key]
        public int Id { get; set; }

        // Información del vehículo
        [Required]
        [MaxLength(255)]
        public string Marca { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string Modelo { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string Matricula { get; set; } = string.Empty;

        public int? Anio { get; set; }

        // Información del cliente
        [Required]
        [MaxLength(255)]
        public string NombreCliente { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string Telefono { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? Correo { get; set; }

        // Información del trabajo
        public string? Descripcion { get; set; }

        // Estado y seguimiento
        [Required]
        [MaxLength(50)]
        public string Estado { get; set; } = "pendiente";

        public bool Revisado { get; set; } = false;

        // Fechas
        public DateTime FechaIngreso { get; set; } = DateTime.Now;

        public DateTime? FechaFinalizacion { get; set; }

        public DateTime FechaCreacion { get; set; } = DateTime.Now;

        public DateTime FechaActualizacion { get; set; } = DateTime.Now;
    }
}