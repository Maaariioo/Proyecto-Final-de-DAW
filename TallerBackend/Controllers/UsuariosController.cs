using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TallerBackend.Data;
using TallerBackend.Models;

namespace TallerBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<UsuariosController> _logger;

        public UsuariosController(AppDbContext context, ILogger<UsuariosController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Usuarios
        // Permite filtrar por mecanico: /api/Usuarios?mecanico=true
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Usuario>>> GetUsuarios([FromQuery] bool? mecanico)
        {
            try
            {
                IQueryable<Usuario> query = _context.Usuarios;

                if (mecanico.HasValue)
                {
                    query = query.Where(u => u.Mecanico == mecanico.Value);
                }

                var usuarios = await query.ToListAsync();
                return Ok(usuarios);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener usuarios");
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // GET: api/Usuarios/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Usuario>> GetUsuario(string id)
        {
            try
            {
                var usuario = await _context.Usuarios.FindAsync(id);

                if (usuario == null)
                {
                    return NotFound($"Usuario con ID {id} no encontrado");
                }

                return Ok(usuario);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener usuario con ID {Id}", id);
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // GET: api/Usuarios/correo/{correo}
        [HttpGet("correo/{correo}")]
        public async Task<ActionResult<Usuario>> GetUsuarioPorCorreo(string correo)
        {
            if (string.IsNullOrEmpty(correo))
            {
                _logger.LogWarning("Solicitud sin correo.");
                return BadRequest("Debe proporcionar un correo.");
            }

            try
            {
                var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Correo == correo);

                if (usuario == null)
                {
                    _logger.LogWarning("Usuario no encontrado con correo {Correo}", correo);
                    return NotFound($"No se encontró un usuario con el correo: {correo}");
                }

                return Ok(usuario);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al buscar usuario por correo {Correo}", correo);
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // POST: api/Usuarios
        [HttpPost]
        public async Task<ActionResult<Usuario>> PostUsuario(Usuario usuario)
        {
            try
            {
                if (await _context.Usuarios.AnyAsync(u => u.Correo == usuario.Correo))
                    return Conflict($"Ya existe un usuario con el correo {usuario.Correo}");

                if (string.IsNullOrEmpty(usuario.Id))
                    usuario.Id = Guid.NewGuid().ToString("N").Substring(0, 10);

                // Mecanico ya tiene valor por defecto false, no hace falta validar

                _context.Usuarios.Add(usuario);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Usuario registrado correctamente: {Correo}", usuario.Correo);
                return CreatedAtAction(nameof(GetUsuario), new { id = usuario.Id }, usuario);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al registrar usuario");
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // PUT: api/Usuarios/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUsuario(string id, Usuario usuarioActualizado)
        {
            if (id != usuarioActualizado.Id)
            {
                return BadRequest("El ID de la URL no coincide con el ID del usuario.");
            }

            try
            {
                var usuarioExistente = await _context.Usuarios.FindAsync(id);
                if (usuarioExistente == null)
                {
                    return NotFound($"Usuario con ID {id} no encontrado.");
                }

                // Verificar si el correo ya existe en otro usuario
                if (usuarioActualizado.Correo != usuarioExistente.Correo)
                {
                    var correoExistente = await _context.Usuarios
                        .AnyAsync(u => u.Correo == usuarioActualizado.Correo && u.Id != id);
                    
                    if (correoExistente)
                    {
                        return Conflict($"Ya existe otro usuario con el correo {usuarioActualizado.Correo}");
                    }
                }

                // Actualizar propiedades
                usuarioExistente.Correo = usuarioActualizado.Correo;
                usuarioExistente.Pass = usuarioActualizado.Pass;
                usuarioExistente.Admin = usuarioActualizado.Admin;
                usuarioExistente.Mecanico = usuarioActualizado.Mecanico;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Usuario actualizado ID: {Id}", id);
                return Ok(usuarioExistente);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar usuario ID {Id}", id);
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // PATCH: api/Usuarios/{id}
        [HttpPatch("{id}")]
        public async Task<IActionResult> PatchUsuario(string id, [FromBody] Dictionary<string, object> updates)
        {
            try
            {
                var usuarioExistente = await _context.Usuarios.FindAsync(id);
                if (usuarioExistente == null)
                {
                    return NotFound($"Usuario con ID {id} no encontrado.");
                }

                foreach (var update in updates)
                {
                    switch (update.Key.ToLower())
                    {
                        case "correo":
                            if (update.Value is string nuevoCorreo)
                            {
                                // Verificar si el correo ya existe en otro usuario
                                if (nuevoCorreo != usuarioExistente.Correo)
                                {
                                    var correoExistente = await _context.Usuarios
                                        .AnyAsync(u => u.Correo == nuevoCorreo && u.Id != id);
                                    
                                    if (correoExistente)
                                    {
                                        return Conflict($"Ya existe otro usuario con el correo {nuevoCorreo}");
                                    }
                                }
                                usuarioExistente.Correo = nuevoCorreo;
                            }
                            break;
                        case "pass":
                            if (update.Value is string pass)
                                usuarioExistente.Pass = pass;
                            break;
                        case "admin":
                            if (bool.TryParse(update.Value.ToString(), out bool admin))
                                usuarioExistente.Admin = admin;
                            break;
                        case "mecanico":
                            if (bool.TryParse(update.Value.ToString(), out bool mecanico))
                                usuarioExistente.Mecanico = mecanico;
                            break;
                    }
                }

                await _context.SaveChangesAsync();
                _logger.LogInformation("Usuario actualizado con PATCH ID: {Id}", id);
                return Ok(usuarioExistente);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar usuario con PATCH ID {Id}", id);
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // DELETE: api/Usuarios/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUsuario(string id)
        {
            try
            {
                var usuario = await _context.Usuarios.FindAsync(id);
                if (usuario == null)
                    return NotFound($"Usuario con ID {id} no encontrado.");

                _context.Usuarios.Remove(usuario);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Usuario eliminado ID {Id}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar usuario ID {Id}", id);
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }
    }
}