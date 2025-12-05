import { httpEntradasTaller } from "./http-axios";

class EntradaTallerService {
  /**
   * Obtener entradas del taller
   * @param {string} estado - Filtrar por estado
   * @param {string} tipo - Filtrar por tipo
   */
  obtenerEntradasTaller(estado = null, tipo = null) {
    let url = "/";
    const params = [];
    
    if (estado) params.push(`estado=${estado}`);
    if (tipo) params.push(`tipo=${tipo}`);
    
    if (params.length > 0) {
      url += `?${params.join("&")}`;
    }

    return httpEntradasTaller.get(url)
      .then(res => {
        console.log("🚗 Entradas del taller obtenidas:", res.data);
        return res;
      })
      .catch(err => {
        console.error("❌ Error al obtener entradas del taller:", err.message);
        throw err;
      });
  }

  /**
   * Añadir nueva entrada al taller
   * @param {Object} data - Datos de la entrada
   */
  añadirEntradaTaller(data) {
    console.log("Añadiendo entrada al taller:", data);
    return httpEntradasTaller.post("/", data)
      .then(res => {
        console.log("Entrada añadida:", res.data);
        return res;
      })
      .catch(err => {
        console.error("Error al añadir entrada:", err.response?.data || err.message);
        throw err;
      });
  }

  /**
   * Actualizar estado de una entrada
   * @param {number} id - ID de la entrada
   * @param {string} estado - Nuevo estado
   */
  actualizarEstadoEntrada(id, estado) {
    console.log("🔄 Actualizando estado de entrada:", id, estado);
    return httpEntradasTaller.patch(`/${id}/estado`, { estado })
      .then(res => {
        console.log("Estado de entrada actualizado:", res.data);
        return res;
      })
      .catch(err => {
        console.error("Error al actualizar estado:", err.response?.data || err.message);
        throw err;
      });
  }

  /**
   * Marcar entrada como revisada
   * @param {number} id - ID de la entrada
   * @param {boolean} revisado - Estado de revisado
   */
  marcarEntradaRevisada(id, revisado = true) {
    console.log("Marcando entrada como revisada:", id, revisado);
    return httpEntradasTaller.patch(`/${id}/revisado`, { revisado })
      .then(res => {
        console.log("Entrada marcada como revisada:", res.data);
        return res;
      })
      .catch(err => {
        console.error("Error al marcar como revisado:", err.response?.data || err.message);
        throw err;
      });
  }

  /**
   * Actualizar entrada completa
   * @param {number} id - ID de la entrada
   * @param {Object} data - Datos actualizados
   */
  actualizarEntrada(id, data) {
    console.log("Actualizando entrada completa ID:", id, data);
    return httpEntradasTaller.put(`/${id}`, data)
      .then(res => {
        console.log("Entrada actualizada:", res.data);
        return res;
      })
      .catch(err => {
        console.error("Error al actualizar entrada:", err.response?.data || err.message);
        throw err;
      });
  }

  /**
   * Eliminar entrada
   * @param {number} id - ID de la entrada
   */
  eliminarEntrada(id) {
    console.log("Eliminando entrada ID:", id);
    return httpEntradasTaller.delete(`/${id}`)
      .then(res => {
        console.log("Entrada eliminada:", res.data);
        return res;
      })
      .catch(err => {
        console.error("Error al eliminar entrada:", err.response?.data || err.message);
        throw err;
      });
  }

  /**
   * Obtener estadísticas del taller
   */
  obtenerEstadisticasTaller() {
    return httpEntradasTaller.get("/estadisticas")
      .then(res => res)
      .catch(err => {
        console.error("Error al obtener estadísticas:", err.message);
        throw err;
      });
  }

  /**
   * Crear entrada desde cita existente
   * @param {Object} cita - Datos de la cita
   */
  crearEntradaDesdeCita(cita) {
    console.log("📋 Creando entrada desde cita:", cita);
    return httpEntradasTaller.post("/desde-cita", cita)
      .then(res => {
        console.log("Entrada creada desde cita:", res.data);
        return res;
      })
      .catch(err => {
        console.error("Error al crear entrada desde cita:", err.response?.data || err.message);
        throw err;
      });
  }
}

export default new EntradaTallerService();