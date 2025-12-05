import { httpUsuarios } from "./http-axios";

class UsuarioService {
  /**
   * Registrar un nuevo usuario
   * @param {Object} data - Datos del usuario { correo, pass, admin? }
   */
  registrarUsuario(data) {
    return httpUsuarios
      .post("/", data)
      .then((response) => {
        console.log("Usuario registrado:", response.data);
        return response.data;
      })
      .catch((error) => {
        console.error("Error al registrar usuario:", error.response?.data || error.message);
        throw error;
      });
  }

  /**
   * Actualizar usuario
   * @param {string} id - ID del usuario
   * @param {Object} data - Datos actualizados
   */
  actualizarUsuario(id, data) {
    console.log("✏️ Actualizando usuario ID:", id, data);
    return httpUsuarios
      .patch(`/${id}`, data)
      .then((response) => {
        console.log("Usuario actualizado:", response.data);
        return response.data;
      })
      .catch((error) => {
        console.error("Error al actualizar usuario:", error.response?.data || error.message);
        throw error;
      });
  }

  /**
   * Obtener usuario por correo
   * @param {string} correo
   */
  obtenerUsuarioPorCorreo(correo) {
    if (!correo) {
      return Promise.reject(new Error("El correo es requerido"));
    }

    return httpUsuarios
      .get(`/correo/${encodeURIComponent(correo)}`)
      .then((response) => {
        console.log("Usuario obtenido:", response.data);
        return response.data;
      })
      .catch((error) => {
        console.error("Error al obtener usuario:", error.response?.data || error.message);
        throw error;
      });
  }

  /**
   * Obtener todos los usuarios
   */
  obtenerTodosLosUsuarios() {
    return httpUsuarios
      .get("/")
      .then((response) => {
        console.log("Todos los usuarios obtenidos:", response.data);
        return Array.isArray(response.data) ? response.data : [];
      })
      .catch((error) => {
        console.error("Error al obtener usuarios:", error.response?.data || error.message);
        throw error;
      });
  }

  /**
   * Obtener usuario por ID
   * @param {string} id - ID del usuario
   */
  obtenerUsuarioPorId(id) {
    if (!id) {
      return Promise.reject(new Error("El ID es requerido"));
    }

    return httpUsuarios
      .get(`/${id}`)
      .then((response) => {
        console.log("Usuario obtenido por ID:", response.data);
        return response.data;
      })
      .catch((error) => {
        console.error("Error al obtener usuario por ID:", error.response?.data || error.message);
        throw error;
      });
  }
}

export default new UsuarioService();