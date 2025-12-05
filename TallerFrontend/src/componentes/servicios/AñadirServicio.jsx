import "../../styles/AñadirServicio.css";
import { ServicioService } from "../../axios/index.js"; // Import corregido
import Swal from "sweetalert2";
import { useState } from "react";

function AñadirServicio({ onClose, onAdd }) {
  const [formData, setFormData] = useState({
    nombre: "",
    precio: "",
    descripcion: "",
    imagen: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const postServicio = (nuevoServicio) => {
    ServicioService.añadirServicio(nuevoServicio)
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Servicio añadido",
          text: "El servicio se ha añadido correctamente.",
        });
        onClose();
        onAdd(nuevoServicio);
      })
      .catch((error) => {
        console.error(
          "Error al añadir el servicio:",
          error.response?.data || error.message
        );
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se ha podido añadir el servicio. Por favor, inténtelo de nuevo más tarde.",
        });
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nuevoServicio = {
      nombre: formData.nombre,
      precio: parseFloat(formData.precio),
      descripcion: formData.descripcion,
      imagen: formData.imagen,
    };
    postServicio(nuevoServicio);
  };

  return (
    <div className="contenedor-formulario-añadir-servicio">
      <h2 className="titulo-formulario-añadir-servicio">
        Añadir Nuevo Servicio
      </h2>
      <form onSubmit={handleSubmit} className="formulario-añadir-servicio">
        <div className="grupo-formulario-añadir-servicio">
          <label
            htmlFor="nombre"
            className="etiqueta-formulario-añadir-servicio"
          >
            Nombre del Servicio
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            className="input-formulario-añadir-servicio"
            placeholder="Ingrese el nombre del servicio"
            required
          />
        </div>

        <div className="grupo-formulario-añadir-servicio">
          <label
            htmlFor="precio"
            className="etiqueta-formulario-añadir-servicio"
          >
            Precio (€)
          </label>
          <input
            type="number"
            id="precio"
            name="precio"
            min="0"
            step="0.01"
            value={formData.precio}
            onChange={handleInputChange}
            className="input-formulario-añadir-servicio"
            placeholder="0.00"
            required
          />
        </div>

        <div className="grupo-formulario-añadir-servicio">
          <label
            htmlFor="descripcion"
            className="etiqueta-formulario-añadir-servicio"
          >
            Descripción
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            className="textarea-formulario-añadir-servicio"
            placeholder="Describa el servicio..."
            rows="4"
            required
          ></textarea>
        </div>

        <div className="grupo-formulario-añadir-servicio">
          <label
            htmlFor="imagen"
            className="etiqueta-formulario-añadir-servicio"
          >
            URL de la Imagen
          </label>
          <input
            type="url"
            id="imagen"
            name="imagen"
            value={formData.imagen}
            onChange={handleInputChange}
            className="input-formulario-añadir-servicio"
            placeholder="https://ejemplo.com/imagen.jpg"
          />
        </div>

        <div className="contenedor-botones-añadir-servicio">
          <button type="submit" className="boton-registrar-servicio">
            Añadir Servicio
          </button>
          <button
            type="button"
            onClick={onClose}
            className="boton-cancelar-añadir-servicio"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default AñadirServicio;
