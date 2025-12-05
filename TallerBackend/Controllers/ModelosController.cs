using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TallerBackend.Data;
using TallerBackend.Models;
using System.Text.Json;

namespace TallerBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ModelosController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ModelosController> _logger;

        public ModelosController(AppDbContext context, ILogger<ModelosController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Modelo>>> GetModelos()
        {
            return await _context.Modelos.Include(m => m.Marca).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Modelo>> GetModelo(int id)
        {
            var modelo = await _context.Modelos.Include(m => m.Marca)
                                               .FirstOrDefaultAsync(m => m.Id == id);
            if (modelo == null) return NotFound();
            return modelo;
        }

        [HttpPost]
        public async Task<ActionResult<Modelo>> PostModelo(Modelo modelo)
        {
            _context.Modelos.Add(modelo);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetModelo), new { id = modelo.Id }, modelo);
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> PatchModelo(int id, [FromBody] JsonElement updates)
        {
            try
            {
                _logger.LogInformation("🔧 PATCH recibido para modelo ID: {Id}", id);
                _logger.LogInformation("📥 Datos recibidos: {Updates}", updates.ToString());

                var modeloExistente = await _context.Modelos.FindAsync(id);
                if (modeloExistente == null)
                {
                    _logger.LogWarning("❌ Modelo no encontrado ID: {Id}", id);
                    return NotFound($"Modelo con ID {id} no encontrado.");
                }

                // Estado antes de la actualización
                _logger.LogInformation("📋 Estado antes: Model={Model}, Slug={Slug}, Marca={Marca}", 
                    modeloExistente.Model, modeloExistente.Slug, modeloExistente.IdMarca);

                // Procesar cada campo del JSON
                foreach (var property in updates.EnumerateObject())
                {
                    switch (property.Name.ToLower())
                    {
                        case "model":
                            if (property.Value.ValueKind == JsonValueKind.String)
                            {
                                modeloExistente.Model = property.Value.GetString();
                                _logger.LogInformation("✏️ Actualizando Model: {Value}", property.Value.GetString());
                            }
                            break;
                        case "slug":
                            if (property.Value.ValueKind == JsonValueKind.String)
                            {
                                modeloExistente.Slug = property.Value.GetString();
                                _logger.LogInformation("✏️ Actualizando Slug: {Value}", property.Value.GetString());
                            }
                            break;
                        case "idmarca":
                            if (property.Value.ValueKind == JsonValueKind.Number && 
                                property.Value.TryGetInt32(out int idMarca))
                            {
                                // Validar que la marca exista
                                var marcaExiste = await _context.Marcas.AnyAsync(m => m.Id == idMarca);
                                if (!marcaExiste)
                                {
                                    _logger.LogWarning("❌ Marca no existe ID: {MarcaId}", idMarca);
                                    return BadRequest("La marca especificada no existe");
                                }
                                modeloExistente.IdMarca = idMarca;
                                _logger.LogInformation("✏️ Actualizando IdMarca: {Value}", idMarca);
                            }
                            break;
                    }
                }

                // Marcar el modelo como modificado
                _context.Entry(modeloExistente).State = EntityState.Modified;

                // Guardar cambios
                int cambios = await _context.SaveChangesAsync();
                _logger.LogInformation("💾 Cambios guardados en BD: {Cambios}", cambios);

                // Estado después de la actualización
                _logger.LogInformation("Estado después: Model={Model}, Slug={Slug}, Marca={Marca}", 
                    modeloExistente.Model, modeloExistente.Slug, modeloExistente.IdMarca);

                return Ok(modeloExistente);
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "Error de BD al actualizar modelo ID: {Id}", id);
                return StatusCode(500, $"Error al actualizar en base de datos: {dbEx.InnerException?.Message ?? dbEx.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inesperado al actualizar modelo ID: {Id}", id);
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // ✅ PUT para compatibilidad
        [HttpPut("{id}")]
        public async Task<IActionResult> PutModelo(int id, Modelo modelo)
        {
            if (id != modelo.Id) return BadRequest();

            _context.Entry(modelo).State = EntityState.Modified;
            
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ModeloExists(id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteModelo(int id)
        {
            var modelo = await _context.Modelos.FindAsync(id);
            if (modelo == null) return NotFound();

            _context.Modelos.Remove(modelo);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool ModeloExists(int id)
        {
            return _context.Modelos.Any(e => e.Id == id);
        }
    }
}