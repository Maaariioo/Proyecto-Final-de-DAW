using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TallerBackend.Data;
using TallerBackend.Models;

namespace TallerBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AniosController : ControllerBase
{
    private readonly AppDbContext _context;

    public AniosController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Anio>>> GetAnios()
    {
        return await _context.Anios.Include(a => a.Modelo).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Anio>> GetAnio(int id)
    {
        var anio = await _context.Anios.Include(a => a.Modelo)
                                       .FirstOrDefaultAsync(a => a.Id == id);
        if (anio == null) return NotFound();
        return anio;
    }

    [HttpPost]
    public async Task<ActionResult<Anio>> PostAnio(Anio anio)
    {
        _context.Anios.Add(anio);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAnio), new { id = anio.Id }, anio);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutAnio(int id, Anio anio)
    {
        if (id != anio.Id) return BadRequest();

        _context.Entry(anio).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAnio(int id)
    {
        var anio = await _context.Anios.FindAsync(id);
        if (anio == null) return NotFound();

        _context.Anios.Remove(anio);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
