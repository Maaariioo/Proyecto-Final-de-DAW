import { useState, useEffect } from "react";
import { PlannerLogService } from "../../axios/index.js"; // Import corregido
import "../../styles/PlannerLogs.css";

function PlannerLog() {
  const [logs, setLogs] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtros, setFiltros] = useState({
    usuario: "",
    fecha: "",
    accion: "",
  });

  useEffect(() => {
    cargarLogs();
  }, []);

  const cargarLogs = async (filtrosAplicados = filtros) => {
    try {
      setCargando(true);
      const response = await PlannerLogService.obtenerLogsPlanner(
        100,
        filtrosAplicados.usuario || null,
        filtrosAplicados.fecha || null
      );
      setLogs(response.data);
    } catch (error) {
      console.error("Error al cargar logs:", error);
      setLogs([]);
    } finally {
      setCargando(false);
    }
  };

  const aplicarFiltros = () => {
    cargarLogs(filtros);
  };

  const limpiarFiltros = () => {
    setFiltros({
      usuario: "",
      fecha: "",
      accion: "",
    });
    cargarLogs({
      usuario: "",
      fecha: "",
      accion: "",
    });
  };

  const formatearFecha = (timestamp) => {
    return new Date(timestamp).toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const descargarLogs = () => {
    const contenido = generarContenidoDescarga();
    const blob = new Blob([contenido], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `logs_planner_${new Date().toISOString().split("T")[0]}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generarContenidoDescarga = () => {
    let contenido = `=== LOGS DEL PLANNER - ${new Date().toLocaleString()} ===\n`;
    contenido += `Total de registros: ${logs.length}\n\n`;

    logs.forEach((log) => {
      contenido += `[${formatearFecha(log.timestamp)}] ${log.usuario} - ${
        log.accion
      }\n`;
      contenido += `   Detalles: ${log.detalles}\n`;

      if (log.estadoAnterior && log.estadoNuevo) {
        contenido += `   Estado: ${log.estadoAnterior} → ${log.estadoNuevo}\n`;
      }

      if (log.vehiculoInfo) {
        contenido += `   Vehículo: ${log.vehiculoInfo}\n`;
      }

      if (log.clienteInfo) {
        contenido += `   Cliente: ${log.clienteInfo}\n`;
      }

      contenido += "\n";
    });

    return contenido;
  };

  const limpiarLogsAntiguos = async () => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar los logs antiguos (más de 1 mes)?"
      )
    ) {
      try {
        await PlannerLogService.limpiarLogsAntiguos();
        cargarLogs();
        alert("Logs antiguos eliminados correctamente");
      } catch (error) {
        console.error("Error al limpiar logs:", error);
        alert("Error al limpiar logs antiguos");
      }
    }
  };

  const getColorAccion = (accion) => {
    switch (accion) {
      case "MOVIMIENTO_ITEM":
        return "#e3f2fd";
      case "NUEVA_ENTRADA":
        return "#e8f5e8";
      case "MARCADO_REVISADO":
        return "#fff3cd";
      case "ELIMINACION_ITEM":
        return "#f8d7da";
      case "GENERAR_PDF_ENTRADA":
      case "GENERAR_PDF_FINALIZACION":
      case "GENERAR_PDF_SEGURO":
      case "GENERAR_PRESUPUESTO":
        return "#e8eaf6";
      case "PRESUPUESTO_ACEPTADO":
        return "#e1f5fe";
      case "PAGO_EXITOSO":
      case "CITA_CREADA":
        return "#f1f8e9";
      case "ERROR_PAGO":
        return "#ffebee";
      default:
        return "#f8f9fa";
    }
  };

  const getIconoAccion = (accion) => {
    switch (accion) {
      case "MOVIMIENTO_ITEM":
        return "🔄";
      case "NUEVA_ENTRADA":
        return "🆕";
      case "MARCADO_REVISADO":
        return "✅";
      case "ELIMINACION_ITEM":
        return "🗑️";
      case "GENERAR_PDF_ENTRADA":
      case "GENERAR_PDF_FINALIZACION":
      case "GENERAR_PDF_SEGURO":
        return "📄";
      case "GENERAR_PRESUPUESTO":
        return "💰";
      case "PRESUPUESTO_ACEPTADO":
        return "🧾";
      case "PAGO_EXITOSO":
        return "💳";
      case "CITA_CREADA":
        return "📅";
      case "ERROR_PAGO":
        return "❌";
      default:
        return "📝";
    }
  };

  // Filtrar logs por acción si se ha seleccionado un filtro
  const logsFiltrados = filtros.accion
    ? logs.filter((log) => log.accion === filtros.accion)
    : logs;

  if (cargando && logs.length === 0) {
    return (
      <div className="planner-logs-container">
        <div className="logs-cargando">
          <p>Cargando logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="planner-logs-container">
      <div className="logs-header">
        <h1>Logs de Actividad - Planner</h1>
        <p>Registro de todas las acciones realizadas en el planner</p>
      </div>

      {/* Filtros */}
      <div className="logs-filtros">
        <div className="filtro-group">
          <label>Usuario:</label>
          <input
            type="text"
            value={filtros.usuario}
            onChange={(e) =>
              setFiltros({ ...filtros, usuario: e.target.value })
            }
            placeholder="Filtrar por usuario..."
          />
        </div>

        <div className="filtro-group">
          <label>Fecha:</label>
          <input
            type="date"
            value={filtros.fecha}
            onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value })}
          />
        </div>

        <div className="filtro-group">
          <label>Acción:</label>
          <select
            value={filtros.accion}
            onChange={(e) => setFiltros({ ...filtros, accion: e.target.value })}
          >
            <option value="">Todas las acciones</option>
            <option value="MOVIMIENTO_ITEM">Movimientos</option>
            <option value="NUEVA_ENTRADA">Nuevas Entradas</option>
            <option value="MARCADO_REVISADO">Marcados Revisados</option>
            <option value="ELIMINACION_ITEM">Eliminaciones</option>
            <option value="GENERAR_PDF_ENTRADA">PDF Entrada</option>
            <option value="GENERAR_PDF_FINALIZACION">PDF Finalización</option>
            <option value="GENERAR_PDF_SEGURO">PDF Seguro</option>
            <option value="GENERAR_PRESUPUESTO">Presupuestos</option>
            <option value="PRESUPUESTO_ACEPTADO">Presupuestos Aceptados</option>
            <option value="CITA_CREADA">Citas Creadas</option>
            <option value="PAGO_EXITOSO">Pagos Exitosos</option>
            <option value="ERROR_PAGO">Errores de Pago</option>
          </select>
        </div>

        <div className="filtro-actions">
          <button onClick={aplicarFiltros} className="btn-aplicar">
            Aplicar Filtros
          </button>
          <button onClick={limpiarFiltros} className="btn-limpiar">
            Limpiar
          </button>
        </div>
      </div>

      {/* Acciones */}
      <div className="logs-actions">
        <button onClick={descargarLogs} className="btn-descargar">
          📥 Descargar Logs
        </button>
        <button onClick={limpiarLogsAntiguos} className="btn-limpiar-antiguos">
          🗑️ Limpiar Logs Antiguos
        </button>
        <button onClick={cargarLogs} className="btn-actualizar">
          🔄 Actualizar
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="logs-estadisticas">
        <div className="estadistica-item">
          <span className="estadistica-numero">{logs.length}</span>
          <span className="estadistica-label">Total Logs</span>
        </div>
        <div className="estadistica-item">
          <span className="estadistica-numero">
            {logs.filter((log) => log.accion === "MOVIMIENTO_ITEM").length}
          </span>
          <span className="estadistica-label">Movimientos</span>
        </div>
        <div className="estadistica-item">
          <span className="estadistica-numero">
            {logs.filter((log) => log.accion === "NUEVA_ENTRADA").length}
          </span>
          <span className="estadistica-label">Nuevas Entradas</span>
        </div>
        <div className="estadistica-item">
          <span className="estadistica-numero">
            {logs.filter((log) => log.accion.includes("GENERAR_PDF")).length}
          </span>
          <span className="estadistica-label">PDFs Generados</span>
        </div>
      </div>

      {/* Lista de Logs */}
      <div className="logs-list">
        {logsFiltrados.length === 0 ? (
          <div className="no-logs">
            <p>No se encontraron logs con los filtros aplicados</p>
          </div>
        ) : (
          logsFiltrados.map((log) => (
            <div
              key={log.id}
              className="log-item"
              style={{ backgroundColor: getColorAccion(log.accion) }}
            >
              <div className="log-header">
                <span className="log-icon">{getIconoAccion(log.accion)}</span>
                <span className="log-timestamp">
                  {formatearFecha(log.timestamp)}
                </span>
                <span className="log-usuario">👤 {log.usuario}</span>
                <span className="log-accion">{log.accion}</span>
              </div>

              <div className="log-details">
                <p className="log-detalle">{log.detalles}</p>

                {log.estadoAnterior && log.estadoNuevo && (
                  <div className="log-estado-cambio">
                    <span className="estado-anterior">
                      {log.estadoAnterior}
                    </span>
                    <span className="estado-flecha">→</span>
                    <span className="estado-nuevo">{log.estadoNuevo}</span>
                  </div>
                )}

                {log.vehiculoInfo && (
                  <div className="log-vehiculo">🚗 {log.vehiculoInfo}</div>
                )}

                {log.clienteInfo && (
                  <div className="log-cliente">👤 {log.clienteInfo}</div>
                )}

                {log.tipoItem && (
                  <div className="log-tipo">
                    Tipo: {log.tipoItem} {log.itemId && `(ID: ${log.itemId})`}
                  </div>
                )}

                {log.numeroFactura && (
                  <div className="log-factura">
                    Factura: {log.numeroFactura}
                  </div>
                )}

                {log.total && (
                  <div className="log-total">Total: {log.total}€</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Contador */}
      <div className="logs-footer">
        <p>
          Mostrando {logsFiltrados.length} de {logs.length} registros
        </p>
        {filtros.accion && (
          <p className="filtro-activo">Filtro activo: {filtros.accion}</p>
        )}
      </div>
    </div>
  );
}

export default PlannerLog;
