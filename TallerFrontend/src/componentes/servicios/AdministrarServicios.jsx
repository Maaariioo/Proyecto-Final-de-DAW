import "../../styles/AdministrarServicios.css";
import { useState, useEffect } from "react";
import { ServicioService } from "../../axios/index.js"; // Import corregido
import Swal from "sweetalert2";
import EditarServicio from "./EditarServicio.jsx";
import AñadirServicio from "./AñadirServicio.jsx";

function AdministrarServicios() {
  const [servicios, setServicios] = useState([]);
  const [formEditarAbierto, setFormEditarAbierto] = useState(false);
  const [modalAñadirAbierto, setModalAñadirAbierto] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = () => {
    ServicioService.obtenerServicios()
      .then((response) => {
        console.log(response.data);
        setServicios(response.data);
      })
      .catch((error) => {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se han podido cargar los servicios. Disculpe las molestias.",
        });
      });
  };

  const borrarServicio = (servicio) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: `Vas a eliminar el servicio "${servicio.nombre}"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        ServicioService.borrarServicio(servicio.id)
          .then(() => {
            setServicios((serviciosAnteriores) =>
              serviciosAnteriores.filter((s) => s.id !== servicio.id)
            );
            Swal.fire(
              "Eliminado!",
              "El servicio ha sido eliminado.",
              "success"
            );
          })
          .catch((error) => {
            console.error(error);
            Swal.fire("Error", "No se pudo eliminar el servicio.", "error");
          });
      }
    });
  };

  const abrirFormEditar = (servicio) => {
    setServicioSeleccionado(servicio);
    setFormEditarAbierto(true);
  };

  const cerrarFormEditar = () => {
    setFormEditarAbierto(false);
    setServicioSeleccionado(null);
  };

  const actualizarServicioEnLista = (servicioActualizado) => {
    setServicios(
      servicios.map((servicio) =>
        servicio.id === servicioActualizado.id ? servicioActualizado : servicio
      )
    );
  };

  const actualizarAlAñadirServicio = (nuevoServicio) => {
    setServicios((serviciosAnteriores) => [
      ...serviciosAnteriores,
      nuevoServicio,
    ]);
  };

  const abrirModalAñadir = () => {
    setModalAñadirAbierto(true);
  };

  const cerrarModalAñadir = () => {
    setModalAñadirAbierto(false);
  };

  return (
    <div className="contenedor-administrar-servicios">
      <h1 className="titulo-administrar-servicios">Administrar Servicios</h1>

      <div className="contenedor-lista-servicios">
        {servicios.length === 0 ? (
          <div className="mensaje-sin-servicios">
            <p>No hay servicios disponibles</p>
          </div>
        ) : (
          servicios.map((servicio) => (
            <div key={servicio.id} className="tarjeta-servicio-administrar">
              <div className="contenedor-imagen-servicio-administrar">
                <img
                  src={servicio.imagen}
                  alt={servicio.nombre}
                  className="imagen-servicio-administrar"
                />
              </div>
              <div className="contenido-tarjeta-servicio-administrar">
                <h3 className="nombre-servicio-administrar">
                  {servicio.nombre}
                </h3>
                <p className="precio-servicio-administrar">
                  {servicio.precio}€
                </p>
                <div className="contenedor-botones-servicio-administrar">
                  <button
                    onClick={() => abrirFormEditar(servicio)}
                    className="boton-editar-servicio-administrar"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => borrarServicio(servicio)}
                    className="boton-eliminar-servicio-administrar"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Editar Servicio */}
      {formEditarAbierto && (
        <div className="modal-editar-servicio-container">
          <div className="contenedor-modal-editar-servicio">
            <button
              className="boton-cerrar-modal-editar-servicio"
              onClick={cerrarFormEditar}
            >
              ×
            </button>
            <EditarServicio
              servicio={servicioSeleccionado}
              onClose={cerrarFormEditar}
              onUpdate={actualizarServicioEnLista}
            />
          </div>
        </div>
      )}

      {/* Modal Añadir Servicio */}
      {modalAñadirAbierto && (
        <div className="modal-añadir-servicio-container">
          <div className="contenedor-modal-añadir-servicio">
            <button
              className="boton-cerrar-modal-añadir-servicio"
              onClick={cerrarModalAñadir}
            >
              ×
            </button>
            <AñadirServicio
              onClose={cerrarModalAñadir}
              onAdd={actualizarAlAñadirServicio}
            />
          </div>
        </div>
      )}

      {/* Botón Flotante Añadir Servicio */}
      <div className="contenedor-boton-flotante-añadir-servicio">
        <button
          className="boton-flotante-añadir-servicio"
          onClick={abrirModalAñadir}
        >
          <span className="icono-boton-añadir-servicio">+</span>
          Añadir Servicio
        </button>
      </div>
    </div>
  );
}

export default AdministrarServicios;
