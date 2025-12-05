import "../../styles/EditarServicio.css";
import Swal from "sweetalert2";
import { ServicioService } from "../../axios/index.js"; // Import corregido

function EditarServicio({ servicio, onClose, onUpdate }) {
  const enviarFormEditar = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const datosServicio = {
      id: servicio.id,
      nombre: formData.get("nombre"),
      precio: parseFloat(formData.get("precio")),
      descripcion: formData.get("descripcion"),
      imagen: formData.get("imagen"),
    };

    ServicioService.actualizarServicio(servicio.id, datosServicio)
      .then((response) => {
        Swal.fire({
          icon: "success",
          title: "Servicio actualizado",
          text: "El servicio se ha actualizado correctamente.",
        });
        onClose();
        onUpdate(response.data);
      })
      .catch((error) => {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "Error al actualizar el servicio",
          text: "No se ha podido actualizar el servicio. Por favor, inténtelo de nuevo más tarde.",
        });
      });
  };

  return (
    <div className="contenedor-formulario-editar-servicio">
      <h2 className="titulo-formulario-editar-servicio">
        Editar Servicio: {servicio.nombre}
      </h2>
      <form onSubmit={enviarFormEditar} className="formulario-editar-servicio">
        <div className="grupo-formulario-editar-servicio">
          <label
            htmlFor="nombre"
            className="etiqueta-formulario-editar-servicio"
          >
            Nombre
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            defaultValue={servicio.nombre}
            className="input-formulario-editar-servicio"
            required
          />
        </div>

        <div className="grupo-formulario-editar-servicio">
          <label
            htmlFor="precio"
            className="etiqueta-formulario-editar-servicio"
          >
            Precio (€)
          </label>
          <input
            type="number"
            id="precio"
            name="precio"
            defaultValue={servicio.precio}
            className="input-formulario-editar-servicio"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="grupo-formulario-editar-servicio">
          <label
            htmlFor="descripcion"
            className="etiqueta-formulario-editar-servicio"
          >
            Descripción
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            defaultValue={servicio.descripcion}
            className="textarea-formulario-editar-servicio"
            rows="4"
          ></textarea>
        </div>

        <div className="grupo-formulario-editar-servicio">
          <label
            htmlFor="imagen"
            className="etiqueta-formulario-editar-servicio"
          >
            URL Imagen
          </label>
          <input
            type="url"
            id="imagen"
            name="imagen"
            defaultValue={servicio.imagen}
            className="input-formulario-editar-servicio"
            required
          />
        </div>

        <div className="contenedor-botones-formulario-editar-servicio">
          <button type="submit" className="boton-guardar-cambios-servicio">
            Guardar Cambios
          </button>
          <button
            type="button"
            onClick={onClose}
            className="boton-cancelar-editar-servicio"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditarServicio;
