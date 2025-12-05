using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TallerBackend.Data;
using TallerBackend.Models;
using System.Text.Json;

namespace TallerBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MarcasController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<MarcasController> _logger;

        public MarcasController(AppDbContext context, ILogger<MarcasController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Marcas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Marca>>> GetMarcas()
        {
            return await _context.Marcas.ToListAsync();
        }

        // GET: api/Marcas/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Marca>> GetMarca(int id)
        {
            var marca = await _context.Marcas
                                      .Include(m => m.Modelos)
                                      .FirstOrDefaultAsync(m => m.Id == id);

            if (marca == null)
                return NotFound();

            return marca;
        }

        // POST: api/Marcas
        [HttpPost]
        public async Task<ActionResult<Marca>> PostMarca(Marca marca)
        {
            _context.Marcas.Add(marca);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMarca), new { id = marca.Id }, marca);
        }

        // ✅ PATCH CORREGIDO
        [HttpPatch("{id}")]
        public async Task<IActionResult> PatchMarca(int id, [FromBody] JsonElement updates)
        {
            try
            {
                _logger.LogInformation("🔧 PATCH recibido para marca ID: {Id}", id);

                var marcaExistente = await _context.Marcas.FindAsync(id);
                if (marcaExistente == null)
                {
                    return NotFound($"Marca con ID {id} no encontrada.");
                }

                foreach (var property in updates.EnumerateObject())
                {
                    switch (property.Name.ToLower())
                    {
                        case "nombre":
                            if (property.Value.ValueKind == JsonValueKind.String)
                            {
                                marcaExistente.Nombre = property.Value.GetString();
                                _logger.LogInformation("✏️ Actualizando Nombre: {Value}", property.Value.GetString());
                            }
                            break;
                        case "slug":
                            if (property.Value.ValueKind == JsonValueKind.String)
                            {
                                marcaExistente.Slug = property.Value.GetString();
                                _logger.LogInformation("✏️ Actualizando Slug: {Value}", property.Value.GetString());
                            }
                            break;
                    }
                }

                _context.Entry(marcaExistente).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                _logger.LogInformation("✅ Marca actualizada correctamente ID: {Id}", id);
                return Ok(marcaExistente);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error al actualizar marca ID: {Id}", id);
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // PUT: api/Marcas/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMarca(int id, Marca marca)
        {
            if (id != marca.Id)
                return BadRequest();

            _context.Entry(marca).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Marcas/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMarca(int id)
        {
            var marca = await _context.Marcas.FindAsync(id);
            if (marca == null)
                return NotFound();

            _context.Marcas.Remove(marca);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}