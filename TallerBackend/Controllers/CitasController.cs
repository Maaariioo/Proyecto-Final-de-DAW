using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TallerBackend.Data;
using TallerBackend.Models;

namespace TallerBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CitasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CitasController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/citas
        [HttpGet]
        public async Task<IActionResult> GetCitas()
        {
            try
            {
                var citas = await _context.Citas
                    .OrderByDescending(c => c.Fecha)
                    .ThenBy(c => c.Hora)
                    .ToListAsync();
                return Ok(citas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // GET: api/citas/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCita(int id)
        {
            var cita = await _context.Citas.FindAsync(id);

            if (cita == null)
                return NotFound();

            return Ok(cita);
        }

        // GET: api/citas/estado/pendiente
        [HttpGet("estado/{estado}")]
        public async Task<IActionResult> GetCitasPorEstado(string estado)
        {
            try
            {
                var estadosValidos = new[] { "pendiente", "en_proceso", "finalizado" };
                if (!estadosValidos.Contains(estado.ToLower()))
                    return BadRequest("Estado no válido. Use: pendiente, en_proceso o finalizado");

                var citas = await _context.Citas
                    .Where(c => c.Estado.ToLower() == estado.ToLower())
                    .OrderByDescending(c => c.Fecha)
                    .ThenBy(c => c.Hora)
                    .ToListAsync();

                return Ok(citas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // GET: api/citas/disponibles?fecha=2025-09-18
        [HttpGet("disponibles")]
        public async Task<IActionResult> GetHorasDisponibles([FromQuery] string fecha)
        {
            try
            {
                if (!DateTime.TryParse(fecha, out DateTime fechaDate))
                    return BadRequest("Formato de fecha inválido");

                var todasLasHoras = new[]
                {
                    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
                    "16:00", "17:00", "18:00"
                };

                var ocupadas = await _context.Citas
                    .Where(c => c.Fecha.Date == fechaDate.Date)
                    .Select(c => c.Hora.ToString(@"hh\:mm"))
                    .ToListAsync();

                var disponibles = todasLasHoras
                    .Where(h => !ocupadas.Contains(h))
                    .ToList();

                return Ok(disponibles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // POST: api/citas
        [HttpPost]
        public async Task<IActionResult> PostCita([FromBody] Cita cita)
        {
            try
            {
                if (cita == null)
                    return BadRequest("La cita no puede ser nula.");

                if (string.IsNullOrEmpty(cita.Nombre))
                    return BadRequest("El nombre es obligatorio");

                if (string.IsNullOrEmpty(cita.Telefono))
                    return BadRequest("El teléfono es obligatorio");

                if (cita.Fecha == default)
                    return BadRequest("La fecha es obligatoria");

                // Validar que la fecha no sea en el pasado
                if (cita.Fecha.Date < DateTime.Today)
                    return BadRequest("No se pueden agendar citas en fechas pasadas");

                // Validar que no sea fin de semana
                if (cita.Fecha.DayOfWeek == DayOfWeek.Saturday || cita.Fecha.DayOfWeek == DayOfWeek.Sunday)
                    return BadRequest("No se pueden agendar citas los fines de semana");

                // Verificar si la hora ya está ocupada
                var existe = await _context.Citas
                    .AnyAsync(c => c.Fecha.Date == cita.Fecha.Date && c.Hora == cita.Hora);

                if (existe)
                    return Conflict("La hora seleccionada ya está ocupada.");

                // Establecer valores por defecto para el planner
                cita.Estado = "pendiente";
                cita.Revisado = false;
                cita.Fecha_Creacion = DateTime.Now;
                cita.Fecha_Actualizacion = DateTime.Now;

                _context.Citas.Add(cita);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetCita), new { id = cita.Id }, cita);
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"Error al guardar en la base de datos: {ex.InnerException?.Message ?? ex.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // PUT: api/citas/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCita(int id, [FromBody] Cita cita)
        {
            try
            {
                if (id != cita.Id)
                    return BadRequest("El ID de la URL no coincide con el de la cita.");

                var citaExistente = await _context.Citas.FindAsync(id);
                if (citaExistente == null)
                    return NotFound();

                // Actualizar todos los campos
                citaExistente.Nombre = cita.Nombre;
                citaExistente.Telefono = cita.Telefono;
                citaExistente.Correo = cita.Correo;
                citaExistente.Marca = cita.Marca;
                citaExistente.Modelo = cita.Modelo;
                citaExistente.Matricula = cita.Matricula;
                citaExistente.Fecha = cita.Fecha;
                citaExistente.Hora = cita.Hora;
                citaExistente.Descripcion = cita.Descripcion;
                citaExistente.Anio = cita.Anio;
                citaExistente.Completada = cita.Completada;

                // Actualizar campos del planner
                citaExistente.Estado = cita.Estado ?? "pendiente";
                citaExistente.Revisado = cita.Revisado;
                citaExistente.Fecha_Actualizacion = DateTime.Now;

                await _context.SaveChangesAsync();

                return Ok(citaExistente);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CitaExists(id))
                    return NotFound();
                else
                    throw;
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // PATCH: api/citas/5 (Actualización general)
        [HttpPatch("{id}")]
        public async Task<IActionResult> PatchCita(int id, [FromBody] Dictionary<string, object> updates)
        {
            try
            {
                var citaExistente = await _context.Citas.FindAsync(id);
                if (citaExistente == null)
                    return NotFound();

                foreach (var update in updates)
                {
                    switch (update.Key.ToLower())
                    {
                        case "nombre":
                            if (update.Value is string nombre)
                                citaExistente.Nombre = nombre;
                            break;
                        case "telefono":
                            if (update.Value is string telefono)
                                citaExistente.Telefono = telefono;
                            break;
                        case "correo":
                            if (update.Value is string correo)
                                citaExistente.Correo = correo;
                            break;
                        case "marca":
                            if (update.Value is string marca)
                                citaExistente.Marca = marca;
                            break;
                        case "modelo":
                            if (update.Value is string modelo)
                                citaExistente.Modelo = modelo;
                            break;
                        case "matricula":
                            if (update.Value is string matricula)
                                citaExistente.Matricula = matricula;
                            break;
                        case "fecha":
                            if (DateTime.TryParse(update.Value.ToString(), out DateTime fecha))
                                citaExistente.Fecha = fecha;
                            break;
                        case "hora":
                            if (TimeSpan.TryParse(update.Value.ToString(), out TimeSpan hora))
                                citaExistente.Hora = hora;
                            break;
                        case "descripcion":
                            if (update.Value is string descripcion)
                                citaExistente.Descripcion = descripcion;
                            break;
                        case "anio":
                            if (int.TryParse(update.Value.ToString(), out int anio))
                                citaExistente.Anio = anio;
                            break;
                        case "completada":
                            if (bool.TryParse(update.Value.ToString(), out bool completada))
                                citaExistente.Completada = completada;
                            break;
                        case "estado":
                            if (update.Value is string estado)
                            {
                                var estadosValidos = new[] { "pendiente", "en_proceso", "finalizado" };
                                if (!estadosValidos.Contains(estado.ToLower()))
                                    return BadRequest("Estado no válido. Use: pendiente, en_proceso o finalizado");
                                citaExistente.Estado = estado.ToLower();
                            }
                            break;
                        case "revisado":
                            if (bool.TryParse(update.Value.ToString(), out bool revisado))
                                citaExistente.Revisado = revisado;
                            break;
                    }
                }

                citaExistente.Fecha_Actualizacion = DateTime.Now;
                await _context.SaveChangesAsync();

                return Ok(citaExistente);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // PATCH: api/citas/5/estado
        [HttpPatch("{id}/estado")]
        public async Task<IActionResult> ActualizarEstadoCita(int id, [FromBody] EstadoCitaRequest request)
        {
            try
            {
                var cita = await _context.Citas.FindAsync(id);
                if (cita == null)
                    return NotFound();

                var estadosValidos = new[] { "pendiente", "en_proceso", "finalizado" };
                if (!estadosValidos.Contains(request.Estado?.ToLower()))
                    return BadRequest("Estado no válido. Use: pendiente, en_proceso o finalizado");

                cita.Estado = request.Estado.ToLower();
                
                // Si se marca como finalizado, resetear revisado a false
                if (request.Estado.ToLower() == "finalizado")
                    cita.Revisado = false;
                    
                cita.Fecha_Actualizacion = DateTime.Now;

                await _context.SaveChangesAsync();

                return Ok(cita);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // PATCH: api/citas/5/revisado
        [HttpPatch("{id}/revisado")]
        public async Task<IActionResult> MarcarComoRevisado(int id, [FromBody] RevisadoCitaRequest request)
        {
            try
            {
                var cita = await _context.Citas.FindAsync(id);
                if (cita == null)
                    return NotFound();

                cita.Revisado = request.Revisado;
                cita.Fecha_Actualizacion = DateTime.Now;

                await _context.SaveChangesAsync();

                return Ok(cita);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // PATCH: api/citas/5/completar
        [HttpPatch("{id}/completar")]
        public async Task<IActionResult> CompletarCita(int id)
        {
            var cita = await _context.Citas.FindAsync(id);
            if (cita == null)
                return NotFound();

            cita.Completada = true;
            cita.Estado = "finalizado";
            cita.Fecha_Actualizacion = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(cita);
        }

        // DELETE: api/citas/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCita(int id)
        {
            try
            {
                var cita = await _context.Citas.FindAsync(id);
                if (cita == null)
                    return NotFound();

                _context.Citas.Remove(cita);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        private bool CitaExists(int id)
        {
            return _context.Citas.Any(e => e.Id == id);
        }

        // Clases para requests (ANIDADAS dentro del controlador)
        public class EstadoCitaRequest
        {
            public string Estado { get; set; } = string.Empty;
        }

        public class RevisadoCitaRequest
        {
            public bool Revisado { get; set; }
        }
    }
}