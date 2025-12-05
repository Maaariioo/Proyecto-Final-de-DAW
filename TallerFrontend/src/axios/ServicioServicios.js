import {
  httpServicios,
  httpUsuarios,
  httpMarcas,
  httpModelos,
  httpAnios,
  httpCitas,
  httpTrabajadores,
  httpEntradasTaller,
  httpPlannerLogs,
  httpPayPal
} from "./http-axios";

class ServicioServicios {
  // PAYPAL - PROCESAMIENTO DE PAGOS
  /**
   * Crear orden de pago en PayPal
   * @param {Object} orderData - Datos de la orden
   */
  crearOrdenPayPal(orderData) {
    console.log("💰 Creando orden de PayPal:", orderData);
    
    return httpPayPal.post("/create-order", orderData)
      .then((response) => {
        console.log("✅ Orden de PayPal creada:", response.data);
        return response.data;
      })
      .catch((error) => {
        console.error("❌ Error al crear orden de PayPal:", error.response?.data || error.message);
        throw error;
      });
  }

  /**
   * Capturar pago de PayPal
   * @param {string} orderID - ID de la orden
   */
  capturarPagoPayPal(orderID) {
    console.log("💰 Capturando pago PayPal, OrderID:", orderID);
    
    return httpPayPal.post(`/capture-order/${orderID}`)
      .then((response) => {
        console.log("Pago de PayPal capturado:", response.data);
        return response.data;
      })
      .catch((error) => {
        console.error("Error al capturar pago de PayPal:", error.response?.data || error.message);
        throw error;
      });
  }

  /**
   * Verificar estado de pago
   * @param {string} orderID - ID de la orden
   */
  verificarEstadoPago(orderID) {
    console.log("Verificando estado de pago:", orderID);
    
    return httpPayPal.get(`/order/${orderID}`)
      .then((response) => {
        console.log("Estado de pago obtenido:", response.data);
        return response.data;
      })
      .catch((error) => {
        console.error("Error al verificar estado de pago:", error.response?.data || error.message);
        throw error;
      });
  }

  //USUARIOS
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


  //TRABAJADORES
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
        await this.actualizarUsuario(data.usuarioId, { mecanico: true });
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
        const trabajador = await this.obtenerTrabajadorPorUsuarioId(idLimpio);
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
        const usuario = await this.obtenerUsuarioPorId(idLimpio);
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
        const trabajador = await this.obtenerTrabajadorPorUsuarioId(usuarioId);
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
      const usuario = await this.obtenerUsuarioPorId(usuarioId);
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
        await this.actualizarUsuario(trabajador.usuarioId, { mecanico: false });
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

  //SERVICIOS
  obtenerServicios() {
    return httpServicios.get("/")
      .then(res => res)
      .catch(err => {
        console.error("Error al obtener servicios:", err.message);
        throw err;
      });
  }

  añadirServicio(data) {
    console.log("Añadiendo servicio:", data);
    return httpServicios.post("/", data)
      .then(res => res)
      .catch(err => {
        console.error("Error al añadir servicio:", err.response?.data || err.message);
        throw err;
      });
  }

  actualizarServicio(id, data) {
    console.log("Actualizando servicio ID:", id);
    return httpServicios.patch(`/${id}`, data)
      .then(res => {
        console.log("Servicio actualizado:", res.data);
        return res;
      })
      .catch(err => {
        console.error("Error al actualizar servicio:", err.response?.data || err.message);
        throw err;
      });
  }

  borrarServicio(id) {
    console.log("Borrando servicio ID:", id);
    return httpServicios.delete(`/${id}`)
      .then(res => res)
      .catch(err => {
        console.error("Error al borrar servicio:", err.response?.data || err.message);
        throw err;
      });
  }

  //MARCAS / MODELOS / AÑOS
  obtenerMarcas() {
    return httpMarcas.get("/")
      .then(res => res)
      .catch(err => {
        console.error("Error al obtener marcas:", err.message);
        throw err;
      });
  }

  obtenerModelos() {
    return httpModelos.get("/")
      .then(res => res)
      .catch(err => {
        console.error("Error al obtener modelos:", err.message);
        throw err;
      });
  }

  obtenerAnios() {
    return httpAnios.get("/")
      .then(res => res)
      .catch(err => {
        console.error("Error al obtener años:", err.message);
        throw err;
      });
  }

  //CITAS
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
          this.guardarLogPlanner({
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
      await this.guardarLogPlanner({
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
      await this.guardarLogPlanner({
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

  //PLANNER - GESTIÓN DE ESTADOS DE CITAS
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


  //MARCAS - CRUD COMPLETO
  añadirMarca(data) {
    console.log("🆕 Añadiendo marca:", data);
    return httpMarcas.post("/", data)
      .then(res => res)
      .catch(err => {
        console.error("❌ Error al añadir marca:", err.response?.data || err.message);
        console.error("❌ Detalles del error:", err);
        throw err;
      });
  }

  actualizarMarca(id, data) {
    console.log("Actualizando marca ID:", id, "Datos:", data);
    return httpMarcas.patch(`/${id}`, data)
      .then(res => {
        console.log("Marca actualizada:", res.data);
        return res;
      })
      .catch(err => {
        console.error("Error al actualizar marca:", err.response?.data || err.message);
        console.error("Detalles del error:", err);
        throw err;
      });
  }

  eliminarMarca(id) {
    console.log("Eliminando marca ID:", id);
    return httpMarcas.delete(`/${id}`)
      .then(res => res)
      .catch(err => {
        console.error("Error al eliminar marca:", err.response?.data || err.message);
        throw err;
      });
  }

  // =====================================================
  // 🚙 MODELOS - CRUD COMPLETO
  // =====================================================

  añadirModelo(data) {
    console.log("🆕 Añadiendo modelo:", data);
    return httpModelos.post("/", data)
      .then(res => res)
      .catch(err => {
        console.error("Error al añadir modelo:", err.response?.data || err.message);
        console.error("Detalles del error:", err);
        throw err;
      });
  }

  actualizarModelo(id, data) {
    console.log("Actualizando modelo ID:", id, "Datos:", data);
    return httpModelos.patch(`/${id}`, data)
      .then(res => {
        console.log("Modelo actualizado:", res.data);
        return res;
      })
      .catch(err => {
        console.error("Error al actualizar modelo:", err.response?.data || err.message);
        console.error("Detalles del error:", err);
        throw err;
      });
  }

  eliminarModelo(id) {
    console.log("Eliminando modelo ID:", id);
    return httpModelos.delete(`/${id}`)
      .then(res => res)
      .catch(err => {
        console.error("Error al eliminar modelo:", err.response?.data || err.message);
        throw err;
      });
  }
  
  //AÑOS - CRUD COMPLETO
  añadirAnio(data) {
    console.log("🆕 Añadiendo año:", data);
    return httpAnios.post("/", data)
      .then(res => res)
      .catch(err => {
        console.error("❌ Error al añadir año:", err.response?.data || err.message);
        console.error("❌ Detalles del error:", err);
        throw err;
      });
  }

  actualizarAnio(id, data) {
    console.log("Actualizando año ID:", id, "Datos:", data);
    return httpAnios.patch(`/${id}`, data)
      .then(res => {
        console.log("Año actualizado:", res.data);
        return res;
      })
      .catch(err => {
        console.error("Error al actualizar año:", err.response?.data || err.message);
        console.error("Detalles del error:", err);
        throw err;
      });
  }

  eliminarAnio(id) {
    console.log("Eliminando año ID:", id);
    return httpAnios.delete(`/${id}`)
      .then(res => res)
      .catch(err => {
        console.error("Error al eliminar año:", err.response?.data || err.message);
        throw err;
      });
  }

  //ENTRADAS TALLER - CRUD COMPLETO
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

  //LOGS DEL PLANNER - NUEVO
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

export default new ServicioServicios();