using System;
using System.ComponentModel.DataAnnotations;

namespace TallerBackend.Models
{
    public class Cita
    {
        public int Id { get; set; }

        [Required]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        public string Telefono { get; set; } = string.Empty;

        public string Correo { get; set; } = string.Empty;

        [Required]
        public string Marca { get; set; } = string.Empty;

        [Required]
        public string Modelo { get; set; } = string.Empty;

        [Required]
        public string Matricula { get; set; } = string.Empty;

        [Required]
        public DateTime Fecha { get; set; }

        [Required]
        public TimeSpan Hora { get; set; }

        [Required]
        public string Descripcion { get; set; } = string.Empty;

        [Required]
        public int Anio { get; set; }

        public bool Completada { get; set; } = false;

        // 🆕 CAMPOS PARA EL PLANNER
        public string Estado { get; set; } = "pendiente";
        public bool Revisado { get; set; } = false;

        public DateTime Fecha_Creacion { get; set; } = DateTime.Now;
        public DateTime Fecha_Actualizacion { get; set; } = DateTime.Now;
    }
}