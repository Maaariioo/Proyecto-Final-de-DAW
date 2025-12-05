import { useState, useEffect } from "react";
import "../../styles/AdministrarCitas.css";
import ServicioServicios from "../../axios/ServicioServicios";

function AdministrarCitas() {
  const [citasPendientes, setCitasPendientes] = useState({});
  const [citasCompletadas, setCitasCompletadas] = useState({});
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarCitas();
  }, []);

  const cargarCitas = () => {
    setCargando(true);
    ServicioServicios.obtenerCitas()
      .then((response) => {
        const citas = response.data || [];
        console.log("Citas recibidas:", citas); // Para debug

        const pendientes = citas.filter(
          (c) => c.estado !== "finalizado" && !c.completada
        );
        const completadas = citas.filter(
          (c) => c.estado === "finalizado" || c.completada
        );

        console.log("Pendientes:", pendientes);
        console.log("Completadas:", completadas);

        setCitasPendientes(agruparCitasPorFecha(pendientes));
        setCitasCompletadas(agruparCitasPorFecha(completadas));
      })
      .catch((error) => {
        console.error("Error al cargar citas:", error);
        setCitasPendientes({});
        setCitasCompletadas({});
      })
      .finally(() => {
        setCargando(false);
      });
  };

  const agruparCitasPorFecha = (citas) => {
    if (!Array.isArray(citas)) return {};

    return citas.reduce((acumulador, cita) => {
      if (!cita || !cita.fecha) return acumulador;

      // Manejar diferentes formatos de fecha
      let fechaKey;
      if (typeof cita.fecha === "string") {
        fechaKey = cita.fecha.split("T")[0]; // yyyy-mm-dd
      } else if (cita.fecha instanceof Date) {
        fechaKey = cita.fecha.toISOString().split("T")[0];
      } else {
        return acumulador; // Si no es un formato válido, saltar
      }

      if (!acumulador[fechaKey]) {
        acumulador[fechaKey] = [];
      }
      acumulador[fechaKey].push(cita);
      return acumulador;
    }, {});
  };

  const completarCita = (id, cita) => {
    const citaActualizada = { ...cita, completada: true, estado: "finalizado" };
    ServicioServicios.marcarCitaComoCompletada(id, citaActualizada)
      .then(cargarCitas)
      .catch((error) => {
        console.error("Error al completar cita:", error);
        Swal.fire("Error", "No se pudo completar la cita", "error");
      });
  };

  const cancelarCita = (id) => {
    Swal.fire({
      title: "¿Cancelar cita?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No, mantener",
    }).then((result) => {
      if (result.isConfirmed) {
        ServicioServicios.eliminarCita(id)
          .then(cargarCitas)
          .catch((error) => {
            console.error("Error al cancelar cita:", error);
            Swal.fire("Error", "No se pudo cancelar la cita", "error");
          });
      }
    });
  };

  const formatFecha = (fechaStr) => {
    try {
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return new Date(fechaStr).toLocaleDateString("es-ES", options);
    } catch (error) {
      console.error("Error formateando fecha:", fechaStr, error);
      return "Fecha inválida";
    }
  };

  const ordenarFechas = (fechas) => {
    return fechas.sort((a, b) => new Date(a) - new Date(b));
  };

  const fechasPendientesOrdenadas = ordenarFechas(Object.keys(citasPendientes));
  const fechasCompletadasOrdenadas = ordenarFechas(
    Object.keys(citasCompletadas)
  );

  if (cargando) {
    return (
      <div className="administrar-citas-container">
        <div className="cargando-citas">
          <div className="spinner"></div>
          <p>Cargando citas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="administrar-citas-container">
      <div className="citas-header">
        <h1>Administrar Citas</h1>
        <button
          onClick={() => setModalAbierto(true)}
          className="btn-ver-completadas"
          disabled={Object.keys(citasCompletadas).length === 0}
        >
          Ver citas completadas ({Object.keys(citasCompletadas).length})
        </button>
      </div>

      <div className="citas-por-fecha">
        {fechasPendientesOrdenadas.length > 0 ? (
          fechasPendientesOrdenadas.map((fecha) => (
            <div key={fecha} className="grupo-fecha">
              <h2 className="fecha-titulo">{formatFecha(fecha)}</h2>
              <div className="citas-del-dia">
                {citasPendientes[fecha].map((cita) => (
                  <div key={cita.id} className="tarjeta-cita">
                    <div className="cita-header">
                      <span className="cita-hora">{cita.hora}</span>
                      <h3 className="cita-nombre">{cita.nombre}</h3>
                      <button
                        onClick={() => cancelarCita(cita.id)}
                        className="btn-cancelar"
                        title="Cancelar cita"
                      >
                        &times;
                      </button>
                    </div>
                    <div className="cita-content">
                      <div className="cita-info">
                        <p>
                          <span className="info-label">Teléfono:</span>{" "}
                          {cita.telefono}
                        </p>
                        <p>
                          <span className="info-label">Email:</span>{" "}
                          {cita.correo}
                        </p>
                      </div>
                      <div className="cita-vehiculo">
                        <p>
                          <span className="info-label">Vehículo:</span>{" "}
                          {cita.marca} {cita.modelo} ({cita.anio})
                        </p>
                        <p>
                          <span className="info-label">Matrícula:</span>{" "}
                          {cita.matricula}
                        </p>
                      </div>
                      <div className="cita-descripcion">
                        <p>
                          <span className="info-label">Descripción:</span>{" "}
                          {cita.descripcion}
                        </p>
                      </div>
                      <div className="cita-estado">
                        <span className={`badge-estado ${cita.estado}`}>
                          {cita.estado?.toUpperCase() || "PENDIENTE"}
                        </span>
                      </div>
                    </div>
                    <div className="cita-acciones">
                      <button
                        onClick={() => completarCita(cita.id, cita)}
                        className="btn-completar"
                      >
                        Marcar como completada
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="no-citas">No hay citas pendientes</p>
        )}
      </div>

      {modalAbierto && (
        <div className="modal-citas-completadas">
          <div className="modal-contenido">
            <div className="modal-header">
              <h2>Citas Completadas</h2>
              <button
                onClick={() => setModalAbierto(false)}
                className="btn-cerrar-modal"
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              {fechasCompletadasOrdenadas.length > 0 ? (
                fechasCompletadasOrdenadas.map((fecha) => (
                  <div key={fecha} className="grupo-fecha">
                    <h3 className="fecha-titulo">{formatFecha(fecha)}</h3>
                    <div className="citas-del-dia">
                      {citasCompletadas[fecha].map((cita) => (
                        <div key={cita.id} className="tarjeta-cita completada">
                          <div className="cita-header">
                            <span className="cita-hora">{cita.hora}</span>
                            <h3 className="cita-nombre">{cita.nombre}</h3>
                            <span className="badge-completada">
                              {cita.completada ? "COMPLETADA" : "FINALIZADA"}
                            </span>
                          </div>
                          <div className="cita-content">
                            <div className="cita-info">
                              <p>
                                <span className="info-label">Teléfono:</span>{" "}
                                {cita.telefono}
                              </p>
                              <p>
                                <span className="info-label">Email:</span>{" "}
                                {cita.correo}
                              </p>
                            </div>
                            <div className="cita-vehiculo">
                              <p>
                                <span className="info-label">Vehículo:</span>{" "}
                                {cita.marca} {cita.modelo} ({cita.anio})
                              </p>
                              <p>
                                <span className="info-label">Matrícula:</span>{" "}
                                {cita.matricula}
                              </p>
                            </div>
                            <div className="cita-descripcion">
                              <p>
                                <span className="info-label">Descripción:</span>{" "}
                                {cita.descripcion}
                              </p>
                            </div>
                            <div className="cita-estado">
                              <span className={`badge-estado ${cita.estado}`}>
                                {cita.estado?.toUpperCase() || "FINALIZADO"}
                              </span>
                              {cita.revisado && (
                                <span className="badge-revisado">REVISADO</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-citas">No hay citas completadas</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdministrarCitas;
