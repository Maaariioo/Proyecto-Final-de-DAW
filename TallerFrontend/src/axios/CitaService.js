import { httpCitas } from "./http-axios";
import PlannerLogService from "./PlannerLogService";

class CitaService {
  /**
   * Registrar una nueva cita con información de pago
   * @param {Object} citaData - Datos de la cita
   * @param {Object} pagoData - Datos del pago (opcional)
   */
  registrarCita(citaData, pagoData = null) {
    try {
      if (!citaData.fecha) {
        throw new Error("La fecha es requerida");
      }

      const fechaDate = new Date(citaData.fecha);
      if (isNaN(fechaDate.getTime())) {
        throw new Error("Fecha inválida");
      }

      const citaParaEnviar = {
        Nombre: citaData.nombre,
        Telefono: citaData.telefono,
        Correo: citaData.correo,
        Marca: citaData.marca,
        Modelo: citaData.modelo,
        Matricula: citaData.matricula,
        Fecha: citaData.fecha,
        Hora: citaData.hora,
        Descripcion: citaData.descripcion,
        Anio: citaData.Anio,
        Completada: citaData.completada || false,
        // Nuevos campos para pago
        PagoReserva: pagoData ? {
          id: pagoData.id,
          estado: pagoData.status,
          monto: "10.00",
          fecha: new Date().toISOString(),
          orderID: pagoData.orderID || null
        } : null,
        DepositoPagado: !!pagoData,
        MontoDeposito: pagoData ? "10.00" : "0.00"
      };

      console.log("Enviando cita al backend:", citaParaEnviar);

      return httpCitas.post("/", citaParaEnviar)
        .then((response) => {
          console.log("Cita registrada exitosamente:", response.data);
          
          // Guardar log del sistema
          PlannerLogService.guardarLogPlanner({
            accion: "CITA_CREADA",
            descripcion: `Nueva cita creada para ${citaData.nombre} - ${citaData.marca} ${citaData.modelo}`,
            usuarioId: "sistema",
            detalles: {
              citaId: response.data.id,
              conPago: !!pagoData,
              matricula: citaData.matricula
            }
          }).catch(err => console.error("Error guardando log:", err));

          return response;
        })
        .catch((error) => {
          console.error("Error al registrar cita:", error.response?.data || error.message);
          throw error;
        });

    } catch (error) {
      console.error("Error al procesar la cita:", error.message);
      return Promise.reject(error);
    }
  }

  /**
   * Procesar cita completa con pago
   * @param {Object} formData - Datos del formulario
   * @param {Object} pagoData - Datos del pago de PayPal
   */
  async procesarCitaConPago(formData, pagoData) {
    try {
      console.log("Procesando cita con pago...");
      
      // 1. Registrar la cita con información de pago
      const citaRegistrada = await this.registrarCita(formData, pagoData);
      
      // 2. Guardar log de la transacción
      await PlannerLogService.guardarLogPlanner({
        accion: "PAGO_EXITOSO",
        descripcion: `Pago de reserva procesado para ${formData.nombre} - ${formData.matricula}`,
        usuarioId: "sistema",
        detalles: {
          citaId: citaRegistrada.data.id,
          orderID: pagoData.orderID,
          monto: "10.00",
          matricula: formData.matricula
        }
      });

      return citaRegistrada;
      
    } catch (error) {
      console.error("Error procesando cita con pago:", error);
      
      // Guardar log de error
      await PlannerLogService.guardarLogPlanner({
        accion: "ERROR_PAGO",
        descripcion: `Error al procesar pago para ${formData.nombre}`,
        usuarioId: "sistema",
        detalles: {
          error: error.message,
          matricula: formData.matricula
        }
      });

      throw error;
    }
  }

  obtenerCitas() {
    return httpCitas.get("/")
      .then(res => {
        console.log("Citas obtenidas del backend:", res.data);
        return res;
      })
      .catch(err => {
        console.error("Error al obtener citas:", err.message);
        throw err;
      });
  }

  marcarCitaComoCompletada(id, citaData) {
    const datosActualizados = { ...citaData, completada: true };

    return httpCitas.patch(`/${id}/completar`, {})
      .then((response) => {
        console.log("Cita marcada como completada:", response.data);
        return response;
      })
      .catch((error) => {
        console.error("Error al marcar cita:", error.response?.data || error.message);
        throw error;
      });
  }

  eliminarCita(id) {
    return httpCitas.delete(`/${id}`)
      .then((response) => {
        console.log("Cita eliminada:", response.data);
        return response;
      })
      .catch((error) => {
        console.error("Error al eliminar cita:", error.response?.data || error.message);
        throw error;
      });
  }

  obtenerHorasDisponibles(fecha) {
    if (!fecha) {
      return Promise.reject(new Error("La fecha es requerida"));
    }

    return httpCitas
      .get(`/disponibles?fecha=${encodeURIComponent(fecha)}`)
      .then((response) => {
        console.log("Horas disponibles para", fecha, ":", response.data);
        return response;
      })
      .catch((error) => {
        console.error("Error al obtener horas disponibles:", error.response?.data || error.message);
        throw error;
      });
  }

  /**
   * Verificar disponibilidad de fecha y hora
   * @param {string} fecha - Fecha en formato YYYY-MM-DD
   * @param {string} hora - Hora en formato HH:MM
   */
  verificarDisponibilidadCita(fecha, hora) {
    if (!fecha || !hora) {
      return Promise.reject(new Error("Fecha y hora son requeridos"));
    }

    console.log("🔍 Verificando disponibilidad:", fecha, hora);
    
    return httpCitas.get(`/disponibilidad?fecha=${encodeURIComponent(fecha)}&hora=${encodeURIComponent(hora)}`)
      .then((response) => {
        console.log("Disponibilidad verificada:", response.data);
        return response.data;
      })
      .catch((error) => {
        console.error("Error al verificar disponibilidad:", error.response?.data || error.message);
        throw error;
      });
  }

  /**
   * Actualizar el estado de una cita (para el planner)
   * @param {number} id - ID de la cita
   * @param {Object} citaActualizada - Datos actualizados de la cita
   */
  actualizarEstadoCita(id, citaActualizada) {
    console.log("🔄 Actualizando estado de cita ID:", id, citaActualizada);
    
    return httpCitas.patch(`/${id}/estado`, {
      estado: citaActualizada.Estado
    })
      .then((response) => {
        console.log("Estado de cita actualizado:", response.data);
        return response;
      })
      .catch((error) => {
        console.error("Error al actualizar estado de cita:", error.response?.data || error.message);
        throw error;
      });
  }

  /**
   * Marcar cita como revisada (para columna finalizado)
   * @param {number} id - ID de la cita
   * @param {Object} citaActualizada - Datos actualizados de la cita
   */
  marcarCitaComoRevisada(id, citaActualizada) {
    console.log("Marcando cita como revisada ID:", id);
    
    return httpCitas.patch(`/${id}/revisado`, {
      revisado: citaActualizada.Revisado
    })
      .then((response) => {
        console.log("Cita marcada como revisada:", response.data);
        return response;
      })
      .catch((error) => {
        console.error("Error al marcar cita como revisada:", error.response?.data || error.message);
        throw error;
      });
  }

  /**
   * Actualizar cita completa (para cuando se necesite actualizar varios campos)
   * @param {number} id - ID de la cita
   * @param {Object} citaActualizada - Datos actualizados de la cita
   */
  actualizarCita(id, citaActualizada) {
    console.log("Actualizando cita completa ID:", id, citaActualizada);
    
    return httpCitas.patch(`/${id}`, citaActualizada)
      .then((response) => {
        console.log("Cita actualizada:", response.data);
        return response;
      })
      .catch((error) => {
        console.error("Error al actualizar cita:", error.response?.data || error.message);
        throw error;
      });
  }

  /**
   * Obtener citas por estado (para filtrar en el planner)
   * @param {string} estado - Estado de las citas a filtrar
   */
  obtenerCitasPorEstado(estado) {
    console.log("Obteniendo citas por estado:", estado);
    
    return httpCitas.get(`/estado/${estado}`)
      .then((response) => {
        console.log(`Citas con estado ${estado} obtenidas:`, response.data);
        return response;
      })
      .catch((error) => {
        console.error(`Error al obtener citas por estado ${estado}:`, error.response?.data || error.message);
        throw error;
      });
  }
}

export default new CitaService();