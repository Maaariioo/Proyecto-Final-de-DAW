using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TallerBackend.Data;
using TallerBackend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TallerBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TrabajadoresController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<TrabajadoresController> _logger;

        public TrabajadoresController(AppDbContext context, ILogger<TrabajadoresController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Trabajadores
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetTrabajadores()
        {
            try
            {
                var trabajadores = await _context.Trabajadores
                    .Include(t => t.Usuario)
                    .Where(t => t.Activo)
                    .Select(t => new
                    {
                        t.Id,
                        t.UsuarioId,
                        t.Nombre,
                        t.Especialidad,
                        t.Telefono,
                        t.FechaContratacion,
                        t.Activo,
                        Correo = t.Usuario != null ? t.Usuario.Correo : string.Empty,
                        EsAdmin = t.Usuario != null ? t.Usuario.Admin : false
                    })
                    .ToListAsync();

                return Ok(trabajadores);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener trabajadores");
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // GET: api/Trabajadores/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Trabajador>> GetTrabajador(string id)
        {
            try
            {
                var trabajador = await _context.Trabajadores
                    .Include(t => t.Usuario)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (trabajador == null)
                {
                    return NotFound($"Trabajador con ID {id} no encontrado.");
                }

                return Ok(trabajador);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener trabajador con ID {Id}", id);
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // GET: api/Trabajadores/usuario/{usuarioId}
        [HttpGet("usuario/{usuarioId}")]
        public async Task<ActionResult<Trabajador>> GetTrabajadorByUsuarioId(string usuarioId)
        {
            try
            {
                var trabajador = await _context.Trabajadores
                    .Include(t => t.Usuario)
                    .FirstOrDefaultAsync(t => t.UsuarioId == usuarioId && t.Activo);

                if (trabajador == null)
                {
                    return NotFound($"Trabajador con usuario ID {usuarioId} no encontrado");
                }

                return Ok(trabajador);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener trabajador por usuario ID {UsuarioId}", usuarioId);
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // POST: api/Trabajadores
        [HttpPost]
        public async Task<ActionResult<Trabajador>> PostTrabajador(Trabajador trabajador)
        {
            try
            {
                // Verificar si el usuario existe
                var usuario = await _context.Usuarios.FindAsync(trabajador.UsuarioId);
                if (usuario == null)
                {
                    return BadRequest($"El usuario con ID {trabajador.UsuarioId} no existe.");
                }

                // Verificar si ya es trabajador
                var trabajadorExistente = await _context.Trabajadores
                    .FirstOrDefaultAsync(t => t.UsuarioId == trabajador.UsuarioId && t.Activo);
                
                if (trabajadorExistente != null)
                {
                    return Conflict($"Este usuario ya está registrado como trabajador.");
                }

                // Generar ID si no viene
                if (string.IsNullOrEmpty(trabajador.Id))
                {
                    trabajador.Id = Guid.NewGuid().ToString("N").Substring(0, 10);
                }

                trabajador.Activo = true;
                if (trabajador.FechaContratacion == null)
                {
                    trabajador.FechaContratacion = DateTime.Now;
                }

                _context.Trabajadores.Add(trabajador);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Trabajador registrado: {Nombre}", trabajador.Nombre);
                return CreatedAtAction(nameof(GetTrabajador), new { id = trabajador.Id }, trabajador);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al registrar trabajador");
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // PUT: api/Trabajadores/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTrabajador(string id, Trabajador trabajadorActualizado)
        {
            if (id != trabajadorActualizado.Id)
            {
                return BadRequest("El ID de la URL no coincide con el ID del trabajador.");
            }

            try
            {
                var trabajadorExistente = await _context.Trabajadores.FindAsync(id);
                if (trabajadorExistente == null)
                {
                    return NotFound($"Trabajador con ID {id} no encontrado.");
                }

                // Actualizar propiedades
                trabajadorExistente.Nombre = trabajadorActualizado.Nombre;
                trabajadorExistente.Especialidad = trabajadorActualizado.Especialidad;
                trabajadorExistente.Telefono = trabajadorActualizado.Telefono;
                trabajadorExistente.FechaContratacion = trabajadorActualizado.FechaContratacion;
                trabajadorExistente.Activo = trabajadorActualizado.Activo;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Trabajador actualizado ID: {Id}", id);
                return Ok(trabajadorExistente);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar trabajador ID {Id}", id);
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // PATCH: api/Trabajadores/{id}
        [HttpPatch("{id}")]
        public async Task<IActionResult> PatchTrabajador(string id, [FromBody] Dictionary<string, object> updates)
        {
            try
            {
                var trabajadorExistente = await _context.Trabajadores.FindAsync(id);
                if (trabajadorExistente == null)
                {
                    return NotFound($"Trabajador con ID {id} no encontrado.");
                }

                foreach (var update in updates)
                {
                    switch (update.Key.ToLower())
                    {
                        case "nombre":
                            if (update.Value is string nombre)
                                trabajadorExistente.Nombre = nombre;
                            break;
                        case "especialidad":
                            if (update.Value is string especialidad)
                                trabajadorExistente.Especialidad = especialidad;
                            break;
                        case "telefono":
                            if (update.Value is string telefono)
                                trabajadorExistente.Telefono = telefono;
                            break;
                        case "fechacontratacion":
                            if (DateTime.TryParse(update.Value.ToString(), out DateTime fechaContratacion))
                                trabajadorExistente.FechaContratacion = fechaContratacion;
                            break;
                        case "activo":
                            if (bool.TryParse(update.Value.ToString(), out bool activo))
                                trabajadorExistente.Activo = activo;
                            break;
                        case "usuarioid":
                            if (update.Value is string usuarioId)
                            {
                                // Validar que el usuario exista
                                var usuarioExiste = await _context.Usuarios.AnyAsync(u => u.Id == usuarioId);
                                if (!usuarioExiste)
                                    return BadRequest("El usuario especificado no existe");
                                trabajadorExistente.UsuarioId = usuarioId;
                            }
                            break;
                    }
                }

                await _context.SaveChangesAsync();
                _logger.LogInformation("Trabajador actualizado con PATCH ID: {Id}", id);
                return Ok(trabajadorExistente);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar trabajador con PATCH ID {Id}", id);
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // DELETE: api/Trabajadores/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTrabajador(string id)
        {
            try
            {
                var trabajador = await _context.Trabajadores.FindAsync(id);
                if (trabajador == null)
                {
                    return NotFound($"Trabajador con ID {id} no encontrado.");
                }

                // En lugar de eliminar, marcamos como inactivo
                trabajador.Activo = false;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Trabajador marcado como inactivo ID: {Id}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar trabajador ID {Id}", id);
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }
    }
}