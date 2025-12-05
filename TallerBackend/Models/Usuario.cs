using System.ComponentModel.DataAnnotations;

namespace TallerBackend.Models
{
    public class Usuario
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString("N").Substring(0, 4);

        [Required]
        [EmailAddress]
        public string Correo { get; set; }

        [Required]
        public string Pass { get; set; }

        public bool Admin { get; set; } = false;
        public bool Mecanico { get; set; } = false;
    }
}
