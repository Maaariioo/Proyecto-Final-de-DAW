import "../../styles/AdministrarTrabajadores.css";
import { useState, useEffect } from "react";
import { TrabajadorService, UsuarioService } from "../../axios/index.js"; // Import corregido
import Swal from "sweetalert2";
import EditarTrabajador from "./EditarTrabajador.jsx";
import AñadirTrabajador from "./AñadirTrabajador.jsx";

function AdministrarTrabajadores() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [formEditarAbierto, setFormEditarAbierto] = useState(false);
  const [modalAñadirAbierto, setModalAñadirAbierto] = useState(false);
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarTrabajadores();
  }, []);

  const cargarTrabajadores = async () => {
    try {
      setCargando(true);
      setError(null);
      const trabajadoresData = await TrabajadorService.obtenerTrabajadores();

      console.log("Trabajadores cargados:", trabajadoresData);
      setTrabajadores(trabajadoresData);
    } catch (error) {
      console.error("Error al cargar trabajadores:", error);
      setError("No se pudieron cargar los trabajadores");
      setTrabajadores([]);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se han podido cargar los trabajadores. Disculpe las molestias.",
      });
    } finally {
      setCargando(false);
    }
  };

  const eliminarTrabajador = (trabajador) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Quieres eliminar a ${trabajador.nombre}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        TrabajadorService.eliminarTrabajador(trabajador.id)
          .then(() => {
            setTrabajadores((trabajadoresActuales) =>
              trabajadoresActuales.filter((t) => t.id !== trabajador.id)
            );
            Swal.fire(
              "Eliminado!",
              "El trabajador ha sido eliminado.",
              "success"
            );
          })
          .catch((error) => {
            console.error("Error al eliminar trabajador:", error);
            Swal.fire("Error", "No se pudo eliminar el trabajador.", "error");
          });
      }
    });
  };

  const abrirFormEditar = (trabajador) => {
    setTrabajadorSeleccionado(trabajador);
    setFormEditarAbierto(true);
  };

  const cerrarFormEditar = () => {
    setFormEditarAbierto(false);
    setTrabajadorSeleccionado(null);
  };

  const actualizarTrabajadorEnLista = (trabajadorActualizado) => {
    setTrabajadores(
      trabajadores.map((trabajador) =>
        trabajador.id === trabajadorActualizado.id
          ? trabajadorActualizado
          : trabajador
      )
    );
  };

  const actualizarAlAñadirTrabajador = (nuevoTrabajador) => {
    setTrabajadores((prevTrabajadores) => [
      ...prevTrabajadores,
      nuevoTrabajador,
    ]);
  };

  const abrirModalAñadir = () => {
    setModalAñadirAbierto(true);
  };

  const cerrarModalAñadir = () => {
    setModalAñadirAbierto(false);
  };

  if (cargando) {
    return (
      <div className="administrar-trabajadores-container">
        <div className="cargando">
          <p>Cargando trabajadores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="administrar-trabajadores-container">
        <div className="error-carga">
          <p>{error}</p>
          <button onClick={cargarTrabajadores} className="boton-reintentar">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="administrar-trabajadores-container">
      <h1 className="titulo-administrar">Administrar Trabajadores</h1>

      <div className="trabajadores-grid">
        {trabajadores.map((trabajador) => (
          <div key={trabajador.id} className="tarjeta-trabajador">
            <div className="info-trabajador">
              <h3>{trabajador.nombre}</h3>
              <p className="correo-trabajador">{trabajador.correo}</p>
              <p className="especialidad-trabajador">
                {trabajador.especialidad || "Especialidad no especificada"}
              </p>
              {trabajador.telefono && (
                <p className="telefono-trabajador">📞 {trabajador.telefono}</p>
              )}
              <p className="fecha-contratacion">
                Contratado:{" "}
                {new Date(trabajador.fechaContratacion).toLocaleDateString()}
              </p>
              <p
                className={`estado-trabajador ${
                  trabajador.activo ? "activo" : "inactivo"
                }`}
              >
                {trabajador.activo ? "🟢 Activo" : "🔴 Inactivo"}
              </p>
            </div>

            <div className="botones-trabajador">
              <div className="boton-borrar">
                <button onClick={() => eliminarTrabajador(trabajador)}>
                  Eliminar
                </button>
              </div>
              <div className="boton-editar">
                <button onClick={() => abrirFormEditar(trabajador)}>
                  Editar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE EDITAR - CORREGIDO */}
      {formEditarAbierto && (
        <div className="formulario-editar-trabajador-container">
          <button
            className="cerrar-formulario-editar"
            onClick={cerrarFormEditar}
          >
            X
          </button>
          <EditarTrabajador
            trabajador={trabajadorSeleccionado}
            onClose={cerrarFormEditar}
            onUpdate={actualizarTrabajadorEnLista}
          />
        </div>
      )}

      <div className="boton-añadir-trabajador">
        <button className="boton-añadir" onClick={abrirModalAñadir}>
          Añadir Trabajador
        </button>
      </div>

      {/* MODAL DE AÑADIR */}
      {modalAñadirAbierto && (
        <div className="modal-añadir-trabajador-container">
          <button className="cerrar-modal-añadir" onClick={cerrarModalAñadir}>
            X
          </button>
          <AñadirTrabajador
            onClose={cerrarModalAñadir}
            onAdd={actualizarAlAñadirTrabajador}
          />
        </div>
      )}

      {trabajadores.length === 0 && (
        <div className="sin-trabajadores">
          <p>No hay trabajadores registrados.</p>
        </div>
      )}
    </div>
  );
}

export default AdministrarTrabajadores;
