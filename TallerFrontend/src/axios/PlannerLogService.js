import { httpPlannerLogs } from "./http-axios";
import UsuarioService from "./UsuarioService";
import TrabajadorService from "./TrabajadorService";

class PlannerLogService {
  /**
   * Obtener nombre para logs - CORREGIDA
   * @param {string} usuarioId - ID del usuario
   */
  async obtenerNombreParaLog(usuarioId) {
    console.log("Buscando nombre para usuarioId:", usuarioId);
    
    try {
      // Validación más robusta del usuarioId
      if (!usuarioId || 
          usuarioId === "undefined" || 
          usuarioId === "null" || 
          usuarioId === "" ||
          typeof usuarioId !== 'string') {
        console.log("No hay usuarioId válido, devolviendo 'Sistema'");
        return "Sistema";
      }

      // Limpiar y validar el ID
      const idLimpio = usuarioId.trim();
      if (idLimpio.length < 2) {
        console.log("ID demasiado corto, devolviendo 'Sistema'");
        return "Sistema";
      }

      console.log("ID limpio para búsqueda:", idLimpio);

      // PRIMERO: Intentar obtener como trabajador
      try {
        console.log("🔍 Buscando como trabajador...");
        const trabajador = await TrabajadorService.obtenerTrabajadorPorUsuarioId(idLimpio);
        console.log("🔍 Resultado trabajador:", trabajador);
        
        if (trabajador && trabajador.nombre && trabajador.nombre.trim() !== '') {
          console.log("Encontrado como trabajador:", trabajador.nombre);
          return trabajador.nombre.trim();
        } else {
          console.log("Trabajador encontrado pero sin nombre válido");
        }
      } catch (error) {
        console.log("No es trabajador o error al buscar trabajador:", error.message);
      }

      // SEGUNDO: Si no es trabajador, obtener usuario normal
      console.log("Buscando como usuario normal...");
      try {
        const usuario = await UsuarioService.obtenerUsuarioPorId(idLimpio);
        console.log("Resultado usuario:", usuario);
        
        if (usuario && usuario.correo && usuario.correo.trim() !== '') {
          console.log("Usuario encontrado:", usuario.correo);
          return usuario.correo.trim();
        }
      } catch (error) {
        console.log("Error al obtener usuario:", error.message);
      }

      // TERCERO: Si todo falla, usar el correo del localStorage
      console.log("Intentando obtener del localStorage...");
      try {
        const usuarioStorage = localStorage.getItem("usuario") || sessionStorage.getItem("usuario");
        if (usuarioStorage) {
          const usuario = JSON.parse(usuarioStorage);
          if (usuario && usuario.correo) {
            console.log("Usuario obtenido de storage:", usuario.correo);
            return usuario.correo;
          }
        }
      } catch (error) {
        console.log("Error al obtener de storage:", error.message);
      }

      console.log("No se pudo obtener nombre, devolviendo 'Usuario'");
      return "Usuario";

    } catch (error) {
      console.error("Error al obtener nombre para log:", error);
      return "Usuario";
    }
  }

  /**
   * Obtener información completa del usuario actual para logs
   * @param {string} usuarioId - ID del usuario
   */
  async obtenerInfoUsuarioParaLog(usuarioId) {
    try {
      if (!usuarioId || usuarioId === "undefined" || usuarioId === "null") {
        return { nombre: "Sistema", tipo: "sistema" };
      }

      // Intentar obtener como trabajador
      try {
        const trabajador = await TrabajadorService.obtenerTrabajadorPorUsuarioId(usuarioId);
        if (trabajador && trabajador.nombre) {
          return { 
            nombre: trabajador.nombre, 
            tipo: "trabajador",
            especialidad: trabajador.especialidad 
          };
        }
      } catch (error) {
        console.log("No es trabajador:", error.message);
      }

      // Obtener como usuario normal
      const usuario = await UsuarioService.obtenerUsuarioPorId(usuarioId);
      if (usuario) {
        return { 
          nombre: usuario.correo, 
          tipo: usuario.admin ? "admin" : "usuario",
          esAdmin: usuario.admin 
        };
      }

      return { nombre: "Usuario", tipo: "desconocido" };

    } catch (error) {
      console.error("Error al obtener info usuario para log:", error);
      return { nombre: "Usuario", tipo: "error" };
    }
  }

  /**
   * Guardar log del planner
   * @param {Object} logData - Datos del log
   */
  async guardarLogPlanner(logData) {
    console.log("Guardando log del planner:", logData);
    try {
      const response = await httpPlannerLogs.post("/", logData);
      console.log("Log guardado:", response.data);
      return response;
    } catch (err) {
      console.error("Error al guardar log:", err.response?.data || err.message);
      // No lanzar error para no interrumpir el flujo principal
      return { data: { success: false, error: err.message } };
    }
  }

  /**
   * Obtener logs del planner
   * @param {number} limit - Límite de logs a obtener
   * @param {string} usuario - Filtrar por usuario
   * @param {string} fecha - Filtrar por fecha
   */
  obtenerLogsPlanner(limit = 100, usuario = null, fecha = null) {
    let url = `/?limit=${limit}`;
    if (usuario) url += `&usuario=${encodeURIComponent(usuario)}`;
    if (fecha) url += `&fecha=${encodeURIComponent(fecha)}`;

    console.log("Obteniendo logs del planner:", url);
    return httpPlannerLogs.get(url)
      .then(res => {
        console.log("Logs obtenidos:", res.data.length);
        return res;
      })
      .catch(err => {
        console.error("Error al obtener logs:", err.response?.data || err.message);
        throw err;
      });
  }

  /**
   * Obtener logs de hoy
   */
  obtenerLogsHoy() {
    console.log("Obteniendo logs de hoy");
    return httpPlannerLogs.get("/hoy")
      .then(res => {
        console.log("Logs de hoy obtenidos:", res.data.length);
        return res;
      })
      .catch(err => {
        console.error("Error al obtener logs de hoy:", err.response?.data || err.message);
        throw err;
      });
  }

  /**
   * Obtener estadísticas de logs
   */
  obtenerEstadisticasLogs() {
    console.log("Obteniendo estadísticas de logs");
    return httpPlannerLogs.get("/estadisticas")
      .then(res => {
        console.log("Estadísticas de logs obtenidas:", res.data);
        return res;
      })
      .catch(err => {
        console.error("Error al obtener estadísticas de logs:", err.response?.data || err.message);
        throw err;
      });
  }

  /**
   * Eliminar log
   * @param {number} id - ID del log
   */
  eliminarLog(id) {
    console.log("Eliminando log ID:", id);
    return httpPlannerLogs.delete(`/${id}`)
      .then(res => {
        console.log("Log eliminado:", res.data);
        return res;
      })
      .catch(err => {
        console.error("Error al eliminar log:", err.response?.data || err.message);
        throw err;
      });
  }

  /**
   * Limpiar logs antiguos
   */
  limpiarLogsAntiguos() {
    console.log("Limpiando logs antiguos");
    return httpPlannerLogs.delete("/limpiar")
      .then(res => {
        console.log("Logs antiguos limpiados:", res.data);
        return res;
      })
      .catch(err => {
        console.error("Error al limpiar logs antiguos:", err.response?.data || err.message);
        throw err;
      });
  }
}

export default new PlannerLogService();