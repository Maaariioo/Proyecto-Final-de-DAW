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
    public class PlannerLogsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<PlannerLogsController> _logger;

        public PlannerLogsController(AppDbContext context, ILogger<PlannerLogsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/PlannerLogs
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PlannerLog>>> GetPlannerLogs(
            [FromQuery] string? usuario = null,
            [FromQuery] string? fecha = null,
            [FromQuery] string? accion = null,
            [FromQuery] int? limit = 100)
        {
            try
            {
                IQueryable<PlannerLog> query = _context.PlannerLogs;

                if (!string.IsNullOrEmpty(usuario))
                {
                    query = query.Where(l => l.Usuario.Contains(usuario));
                }

                if (!string.IsNullOrEmpty(accion))
                {
                    query = query.Where(l => l.Accion.Contains(accion));
                }

                if (!string.IsNullOrEmpty(fecha) && DateTime.TryParse(fecha, out DateTime fechaFiltro))
                {
                    query = query.Where(l => l.Timestamp.Date == fechaFiltro.Date);
                }

                var logs = await query
                    .OrderByDescending(l => l.Timestamp)
                    .Take(limit ?? 100)
                    .ToListAsync();

                return Ok(logs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener logs del planner");
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // GET: api/PlannerLogs/hoy
        [HttpGet("hoy")]
        public async Task<ActionResult<IEnumerable<PlannerLog>>> GetLogsHoy()
        {
            try
            {
                var hoy = DateTime.Today;
                var logs = await _context.PlannerLogs
                    .Where(l => l.Timestamp.Date == hoy)
                    .OrderByDescending(l => l.Timestamp)
                    .ToListAsync();

                return Ok(logs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener logs de hoy");
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // GET: api/PlannerLogs/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PlannerLog>> GetPlannerLog(int id)
        {
            try
            {
                var log = await _context.PlannerLogs.FindAsync(id);

                if (log == null)
                {
                    return NotFound($"Log con ID {id} no encontrado");
                }

                return Ok(log);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener log con ID {Id}", id);
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // POST: api/PlannerLogs
        [HttpPost]
        public async Task<ActionResult<PlannerLog>> PostPlannerLog(PlannerLog log)
        {
            try
            {
                // Asegurar que el timestamp sea preciso
                log.Timestamp = DateTime.Now;

                _context.PlannerLogs.Add(log);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetPlannerLog), new { id = log.Id }, log);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al guardar log del planner");
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // GET: api/PlannerLogs/estadisticas
        [HttpGet("estadisticas")]
        public async Task<ActionResult<object>> GetEstadisticas()
        {
            try
            {
                var hoy = DateTime.Today;
                var logsHoy = await _context.PlannerLogs
                    .Where(l => l.Timestamp.Date == hoy)
                    .CountAsync();

                var topUsuarios = await _context.PlannerLogs
                    .Where(l => l.Timestamp.Date == hoy)
                    .GroupBy(l => l.Usuario)
                    .Select(g => new { Usuario = g.Key, Acciones = g.Count() })
                    .OrderByDescending(x => x.Acciones)
                    .Take(5)
                    .ToListAsync();

                var accionesComunes = await _context.PlannerLogs
                    .Where(l => l.Timestamp.Date == hoy)
                    .GroupBy(l => l.Accion)
                    .Select(g => new { Accion = g.Key, Count = g.Count() })
                    .OrderByDescending(x => x.Count)
                    .Take(5)
                    .ToListAsync();

                return Ok(new
                {
                    LogsHoy = logsHoy,
                    TopUsuarios = topUsuarios,
                    AccionesComunes = accionesComunes
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener estadísticas de logs");
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // DELETE: api/PlannerLogs/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePlannerLog(int id)
        {
            try
            {
                var log = await _context.PlannerLogs.FindAsync(id);
                if (log == null)
                {
                    return NotFound($"Log con ID {id} no encontrado");
                }

                _context.PlannerLogs.Remove(log);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar log ID {Id}", id);
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // DELETE: api/PlannerLogs/limpiar
        [HttpDelete("limpiar")]
        public async Task<IActionResult> LimpiarLogsAntiguos()
        {
            try
            {
                var fechaLimite = DateTime.Now.AddMonths(-1); // Mantener solo logs del último mes
                var logsAntiguos = await _context.PlannerLogs
                    .Where(l => l.Timestamp < fechaLimite)
                    .ToListAsync();

                _context.PlannerLogs.RemoveRange(logsAntiguos);
                await _context.SaveChangesAsync();

                return Ok(new { mensaje = $"Se eliminaron {logsAntiguos.Count} logs antiguos" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al limpiar logs antiguos");
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }
    }
}