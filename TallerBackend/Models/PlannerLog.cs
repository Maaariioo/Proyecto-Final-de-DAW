using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TallerBackend.Models
{
    [Table("planner_logs")]
    public class PlannerLog
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("timestamp")]
        public DateTime Timestamp { get; set; } = DateTime.Now;

        [Required]
        [StringLength(50)]
        [Column("usuario")]
        public string Usuario { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        [Column("accion")]
        public string Accion { get; set; } = string.Empty;

        [Column("detalles")]
        public string Detalles { get; set; } = string.Empty;

        [StringLength(50)]
        [Column("tipo_item")]
        public string? TipoItem { get; set; }

        [Column("item_id")]
        public int? ItemId { get; set; }

        [StringLength(50)]
        [Column("estado_anterior")]
        public string? EstadoAnterior { get; set; }

        [StringLength(50)]
        [Column("estado_nuevo")]
        public string? EstadoNuevo { get; set; }

        [StringLength(255)]
        [Column("vehiculo_info")]
        public string? VehiculoInfo { get; set; }

        [StringLength(100)]
        [Column("cliente_info")]
        public string? ClienteInfo { get; set; }
    }
}