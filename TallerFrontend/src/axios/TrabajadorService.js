import { httpTrabajadores } from "./http-axios";
import UsuarioService from "./UsuarioService";

class TrabajadorService {
  /**
   * Obtener todos los trabajadores
   */
  obtenerTrabajadores() {
    return httpTrabajadores
      .get("/")
      .then((response) => {
        console.log("🔍 Trabajadores obtenidos:", response.data);
        return Array.isArray(response.data) ? response.data : [];
      })
      .catch((error) => {
        console.error("❌ Error al obtener trabajadores:", error.response?.data || error.message);
        throw error;
      });
  }

  /**
   * Añadir nuevo trabajador
   * @param {Object} data - Datos del trabajador
   */
  async añadirTrabajador(data) {
    console.log("🆕 Añadiendo trabajador:", data);
    
    try {
      // Primero actualizar el usuario para marcarlo como mecánico
      if (data.usuarioId) {
        await UsuarioService.actualizarUsuario(data.usuarioId, { mecanico: true });
        console.log("Usuario actualizado como mecánico");
      }

      // Luego crear el trabajador
      const response = await httpTrabajadores.post("/", data);
      console.log("Trabajador añadido:", response.data);
      return response.data;
      
    } catch (error) {
      console.error("Error al añadir trabajador:", error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Obtener trabajador por ID de usuario
   * @param {string} usuarioId - ID del usuario
   */
  obtenerTrabajadorPorUsuarioId(usuarioId) {
    if (!usuarioId) {
      return Promise.reject(new Error("El ID de usuario es requerido"));
    }

    return httpTrabajadores
      .get(`/usuario/${usuarioId}`)
      .then((response) => {
        console.log("🔍 Trabajador obtenido por ID usuario:", response.data);
        return response.data;
      })
      .catch((error) => {
        console.error("Error al obtener trabajador por ID usuario:", error.response?.data || error.message);
        throw error;
      });
  }

  /**
   * Actualizar trabajador existente
   * @param {string} id - ID del trabajador
   * @param {Object} data - Datos actualizados
   */
  actualizarTrabajador(id, data) {
    console.log("✏️ Actualizando trabajador ID:", id);
    
    return httpTrabajadores
      .patch(`/${id}`, data)
      .then((response) => {
        console.log("Trabajador actualizado:", response.data);
        return response.data;
      })
      .catch((error) => {
        console.error("Error al actualizar trabajador:", error.response?.data || error.message);
        throw error;
      });
  }

  /**
   * Eliminar trabajador
   * @param {string} id - ID del trabajador
   */
  async eliminarTrabajador(id) {
    console.log("Eliminando trabajador ID:", id);
    
    try {
      // Primero obtener el trabajador para saber el usuarioId
      const trabajador = await httpTrabajadores.get(`/${id}`).then(res => res.data);
      
      // Actualizar el usuario para quitarle el rol de mecánico
      if (trabajador && trabajador.usuarioId) {
        await UsuarioService.actualizarUsuario(trabajador.usuarioId, { mecanico: false });
        console.log("Usuario actualizado como no mecánico");
      }

      // Luego eliminar el trabajador
      const response = await httpTrabajadores.delete(`/${id}`);
      console.log("Trabajador eliminado:", response.data);
      return response.data;
      
    } catch (error) {
      console.error("Error al eliminar trabajador:", error.response?.data || error.message);
      throw error;
    }
  }
}

export default new TrabajadorService();