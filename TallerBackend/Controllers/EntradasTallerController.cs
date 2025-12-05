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
    public class EntradasTallerController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<EntradasTallerController> _logger;

        public EntradasTallerController(AppDbContext context, ILogger<EntradasTallerController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/EntradasTaller
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EntradaTaller>>> GetEntradasTaller(
            [FromQuery] string? estado = null,
            [FromQuery] string? fecha = null)
        {
            try
            {
                IQueryable<EntradaTaller> query = _context.EntradasTaller;

                // Filtros opcionales
                if (!string.IsNullOrEmpty(estado))
                {
                    query = query.Where(e => e.Estado == estado);
                }

                if (!string.IsNullOrEmpty(fecha) && DateTime.TryParse(fecha, out DateTime fechaFiltro))
                {
                    query = query.Where(e => e.FechaIngreso.Date == fechaFiltro.Date);
                }

                var entradas = await query
                    .OrderByDescending(e => e.FechaIngreso)
                    .ThenBy(e => e.Estado)
                    .ToListAsync();

                return Ok(entradas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener entradas del taller");
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // GET: api/EntradasTaller/5
        [HttpGet("{id}")]
        public async Task<ActionResult<EntradaTaller>> GetEntradaTaller(int id)
        {
            try
            {
                var entrada = await _context.EntradasTaller.FindAsync(id);

                if (entrada == null)
                {
                    return NotFound($"Entrada con ID {id} no encontrada");
                }

                return Ok(entrada);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener entrada con ID {Id}", id);
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // POST: api/EntradasTaller
        [HttpPost]
        public async Task<ActionResult<EntradaTaller>> PostEntradaTaller(EntradaTaller entrada)
        {
            try
            {
                // Validaciones básicas
                if (string.IsNullOrEmpty(entrada.Marca) || 
                    string.IsNullOrEmpty(entrada.Modelo) || 
                    string.IsNullOrEmpty(entrada.Matricula))
                {
                    return BadRequest("Marca, Modelo y Matrícula son obligatorios");
                }

                // Verificar si ya existe una entrada con la misma matrícula en estado activo
                var existeMatricula = await _context.EntradasTaller
                    .AnyAsync(e => e.Matricula == entrada.Matricula && 
                                  (e.Estado == "pendiente" || e.Estado == "en_proceso"));

                if (existeMatricula)
                {
                    return Conflict($"Ya existe una entrada activa para la matrícula {entrada.Matricula}");
                }

                // Establecer valores por defecto
                entrada.FechaIngreso = DateTime.Now;
                entrada.FechaCreacion = DateTime.Now;
                entrada.FechaActualizacion = DateTime.Now;

                if (string.IsNullOrEmpty(entrada.Estado))
                {
                    entrada.Estado = "pendiente";
                }

                _context.EntradasTaller.Add(entrada);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Nueva entrada creada: {Matricula}", entrada.Matricula);

                return CreatedAtAction(nameof(GetEntradaTaller), new { id = entrada.Id }, entrada);
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "Error de BD al crear entrada");
                return StatusCode(500, $"Error al guardar en base de datos: {dbEx.InnerException?.Message ?? dbEx.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inesperado al crear entrada");
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // POST: api/EntradasTaller/desde-cita
        [HttpPost("desde-cita")]
        public async Task<ActionResult<EntradaTaller>> CrearEntradaDesdeCita([FromBody] Cita cita)
        {
            try
            {
                var entrada = new EntradaTaller
                {
                    Marca = cita.Marca,
                    Modelo = cita.Modelo,
                    Matricula = cita.Matricula,
                    Anio = cita.Anio,
                    NombreCliente = cita.Nombre,
                    Telefono = cita.Telefono,
                    Correo = cita.Correo,
                    Descripcion = cita.Descripcion,
                    Estado = "pendiente",
                    FechaIngreso = DateTime.Now
                };

                _context.EntradasTaller.Add(entrada);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Entrada creada desde cita: {Matricula}", entrada.Matricula);

                return CreatedAtAction(nameof(GetEntradaTaller), new { id = entrada.Id }, entrada);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear entrada desde cita");
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // PUT: api/EntradasTaller/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEntradaTaller(int id, EntradaTaller entradaActualizada)
        {
            try
            {
                if (id != entradaActualizada.Id)
                {
                    return BadRequest("El ID de la URL no coincide con el ID de la entrada");
                }

                var entradaExistente = await _context.EntradasTaller.FindAsync(id);
                if (entradaExistente == null)
                {
                    return NotFound($"Entrada con ID {id} no encontrada");
                }

                // Actualizar propiedades
                entradaExistente.Marca = entradaActualizada.Marca;
                entradaExistente.Modelo = entradaActualizada.Modelo;
                entradaExistente.Matricula = entradaActualizada.Matricula;
                entradaExistente.Anio = entradaActualizada.Anio;
                entradaExistente.NombreCliente = entradaActualizada.NombreCliente;
                entradaExistente.Telefono = entradaActualizada.Telefono;
                entradaExistente.Correo = entradaActualizada.Correo;
                entradaExistente.Descripcion = entradaActualizada.Descripcion;
                entradaExistente.FechaActualizacion = DateTime.Now;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Entrada actualizada ID: {Id}", id);
                return Ok(entradaExistente);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar entrada ID {Id}", id);
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // PATCH: api/EntradasTaller/5/estado
        [HttpPatch("{id}/estado")]
        public async Task<IActionResult> ActualizarEstado(int id, [FromBody] EstadoUpdateRequest request)
        {
            try
            {
                var entrada = await _context.EntradasTaller.FindAsync(id);
                if (entrada == null)
                {
                    return NotFound($"Entrada con ID {id} no encontrada");
                }

                var estadosValidos = new[] { "pendiente", "en_proceso", "finalizado" };
                if (!estadosValidos.Contains(request.Estado?.ToLower()))
                {
                    return BadRequest("Estado no válido. Use: pendiente, en_proceso o finalizado");
                }

                entrada.Estado = request.Estado.ToLower();
                entrada.FechaActualizacion = DateTime.Now;

                // Si se marca como finalizado, registrar fecha de finalización
                if (request.Estado.ToLower() == "finalizado")
                {
                    entrada.FechaFinalizacion = DateTime.Now;
                    entrada.Revisado = false; // Resetear revisado
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Estado actualizado para entrada ID {Id}: {Estado}", id, request.Estado);
                return Ok(entrada);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar estado de entrada ID {Id}", id);
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // PATCH: api/EntradasTaller/5/revisado
        [HttpPatch("{id}/revisado")]
        public async Task<IActionResult> MarcarComoRevisado(int id, [FromBody] RevisadoUpdateRequest request)
        {
            try
            {
                var entrada = await _context.EntradasTaller.FindAsync(id);
                if (entrada == null)
                {
                    return NotFound($"Entrada con ID {id} no encontrada");
                }

                entrada.Revisado = request.Revisado;
                entrada.FechaActualizacion = DateTime.Now;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Entrada ID {Id} marcada como revisado: {Revisado}", id, request.Revisado);
                return Ok(entrada);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al marcar entrada como revisado ID {Id}", id);
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // DELETE: api/EntradasTaller/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEntradaTaller(int id)
        {
            try
            {
                var entrada = await _context.EntradasTaller.FindAsync(id);
                if (entrada == null)
                {
                    return NotFound($"Entrada con ID {id} no encontrada");
                }

                _context.EntradasTaller.Remove(entrada);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Entrada eliminada ID: {Id}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar entrada ID {Id}", id);
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // GET: api/EntradasTaller/estadisticas
        [HttpGet("estadisticas")]
        public async Task<ActionResult<object>> GetEstadisticas()
        {
            try
            {
                var total = await _context.EntradasTaller.CountAsync();
                var porEstado = await _context.EntradasTaller
                    .GroupBy(e => e.Estado)
                    .Select(g => new { Estado = g.Key, Count = g.Count() })
                    .ToListAsync();

                var hoy = await _context.EntradasTaller
                    .CountAsync(e => e.FechaIngreso.Date == DateTime.Today);

                return Ok(new
                {
                    Total = total,
                    PorEstado = porEstado,
                    IngresosHoy = hoy
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener estadísticas");
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // Clases para requests (ANIDADAS dentro del controlador)
        public class EstadoUpdateRequest
        {
            public string Estado { get; set; } = string.Empty;
        }

        public class RevisadoUpdateRequest
        {
            public bool Revisado { get; set; }
        }
    }
}