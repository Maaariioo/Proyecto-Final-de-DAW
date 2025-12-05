using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TallerBackend.Data;
using TallerBackend.Models;
using System.Text.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TallerBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServiciosController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ServiciosController> _logger;

        public ServiciosController(AppDbContext context, ILogger<ServiciosController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Servicios
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Servicio>>> GetServicios()
        {
            try
            {
                var servicios = await _context.Servicios.ToListAsync();
                return Ok(servicios);
            }
            catch (MySqlConnector.MySqlException mysqlEx)
            {
                _logger.LogError(mysqlEx, "Error de MySQL al obtener servicios");
                return StatusCode(500, $"Error de base de datos: {mysqlEx.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inesperado al obtener servicios");
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // GET: api/Servicios/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Servicio>> GetServicio(int id)
        {
            try
            {
                var servicio = await _context.Servicios.FindAsync(id);
                if (servicio == null)
                {
                    _logger.LogWarning("Servicio no encontrado para ID: {Id}", id);
                    return NotFound($"Servicio con ID {id} no encontrado.");
                }

                return Ok(servicio);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener servicio con ID {Id}", id);
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // POST: api/Servicios
        [HttpPost]
        public async Task<ActionResult<Servicio>> PostServicio(Servicio servicio)
        {
            try
            {
                _context.Servicios.Add(servicio);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetServicio), new { id = servicio.Id }, servicio);
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "Error al guardar el servicio en la base de datos");
                return StatusCode(500, $"Error al guardar en base de datos: {dbEx.InnerException?.Message ?? dbEx.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inesperado al crear servicio");
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // PUT: api/Servicios/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutServicio(int id, Servicio servicio)
        {
            _logger.LogInformation("PUT recibido para ID: {Id}", id);
            _logger.LogInformation("Datos recibidos: {Servicio}", JsonSerializer.Serialize(servicio));

            if (id != servicio.Id)
            {
                _logger.LogWarning("IDs no coinciden: URL {Id} vs Body {BodyId}", id, servicio.Id);
                return BadRequest("El ID de la URL no coincide con el ID del servicio.");
            }

            var servicioExistente = await _context.Servicios.FindAsync(id);
            if (servicioExistente == null)
            {
                _logger.LogWarning("Servicio no encontrado para ID {Id}", id);
                return NotFound($"Servicio con ID {id} no encontrado.");
            }

            servicioExistente.Nombre = servicio.Nombre;
            servicioExistente.Precio = servicio.Precio;
            servicioExistente.Descripcion = servicio.Descripcion;
            servicioExistente.Imagen = servicio.Imagen;

            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("PUT exitoso para ID {Id}", id);
                return NoContent();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogError(ex, "Error de concurrencia al actualizar servicio ID {Id}", id);
                if (!ServicioExists(id))
                    return NotFound();
                return StatusCode(500, "Error de concurrencia en la base de datos.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error interno al actualizar servicio ID {Id}", id);
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // PATCH: api/Servicios/5
        [HttpPatch("{id}")]
        public async Task<IActionResult> PatchServicio(int id, [FromBody] Dictionary<string, object> updates)
        {
            try
            {
                var servicioExistente = await _context.Servicios.FindAsync(id);
                if (servicioExistente == null)
                {
                    _logger.LogWarning("Servicio no encontrado para PATCH ID {Id}", id);
                    return NotFound($"Servicio con ID {id} no encontrado.");
                }

                _logger.LogInformation("PATCH recibido para ID: {Id}, Updates: {Updates}", 
                    id, JsonSerializer.Serialize(updates));

                foreach (var update in updates)
                {
                    switch (update.Key.ToLower())
                    {
                        case "nombre":
                            if (update.Value is string nombre)
                                servicioExistente.Nombre = nombre;
                            break;
                        case "precio":
                            if (decimal.TryParse(update.Value.ToString(), out decimal precio))
                                servicioExistente.Precio = precio;
                            break;
                        case "descripcion":
                            if (update.Value is string descripcion)
                                servicioExistente.Descripcion = descripcion;
                            break;
                        case "imagen":
                            if (update.Value is string imagen)
                                servicioExistente.Imagen = imagen;
                            break;
                    }
                }

                await _context.SaveChangesAsync();
                _logger.LogInformation("PATCH exitoso para ID {Id}", id);
                return Ok(servicioExistente);
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "Error de base de datos al actualizar servicio con PATCH ID {Id}", id);
                return StatusCode(500, $"Error al actualizar en base de datos: {dbEx.InnerException?.Message ?? dbEx.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error interno al actualizar servicio con PATCH ID {Id}", id);
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // DELETE: api/Servicios/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteServicio(int id)
        {
            try
            {
                var servicio = await _context.Servicios.FindAsync(id);
                if (servicio == null)
                {
                    _logger.LogWarning("Servicio no encontrado para DELETE ID {Id}", id);
                    return NotFound($"Servicio con ID {id} no encontrado.");
                }

                _context.Servicios.Remove(servicio);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Servicio eliminado exitosamente ID {Id}", id);
                return NoContent();
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "Error al eliminar servicio ID {Id}", id);
                return StatusCode(500, $"Error al eliminar en base de datos: {dbEx.InnerException?.Message ?? dbEx.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error interno al eliminar servicio ID {Id}", id);
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        private bool ServicioExists(int id)
        {
            return _context.Servicios.Any(e => e.Id == id);
        }
    }
}