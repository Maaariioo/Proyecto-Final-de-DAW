using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TallerBackend.Models
{
    [Table("trabajadores")] // Asegurar que mapea a la tabla correcta
    public class Trabajador
    {
        [Key]
        [Column("id")]
        public string Id { get; set; } = string.Empty;

        [Required]
        [Column("usuario_id")]
        public string UsuarioId { get; set; } = string.Empty;

        [ForeignKey("UsuarioId")]
        public Usuario? Usuario { get; set; }

        [Required]
        [StringLength(100)]
        [Column("nombre")]
        public string Nombre { get; set; } = string.Empty;

        [StringLength(100)]
        [Column("especialidad")]
        public string? Especialidad { get; set; }

        [StringLength(20)]
        [Column("telefono")]
        public string? Telefono { get; set; }

        [Column("fecha_contratacion")]
        public DateTime? FechaContratacion { get; set; }

        [Column("activo")]
        public bool Activo { get; set; } = true;
    }
}