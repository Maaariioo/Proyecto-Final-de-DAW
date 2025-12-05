import { useState, useEffect } from "react";
import { TrabajadorService } from "../../axios/index.js"; // Import corregido
import Swal from "sweetalert2";
import "../../styles/EditarTrabajador.css";

function EditarTrabajador({ trabajador, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    nombre: "",
    especialidad: "",
    telefono: "",
    fechaContratacion: "",
    activo: true,
  });

  useEffect(() => {
    if (trabajador) {
      setFormData({
        nombre: trabajador.nombre || "",
        especialidad: trabajador.especialidad || "",
        telefono: trabajador.telefono || "",
        fechaContratacion: trabajador.fechaContratacion
          ? trabajador.fechaContratacion.split("T")[0]
          : "",
        activo: trabajador.activo !== undefined ? trabajador.activo : true,
      });
    }
  }, [trabajador]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    TrabajadorService.actualizarTrabajador(trabajador.id, formData)
      .then((trabajadorActualizado) => {
        onUpdate(trabajadorActualizado);
        Swal.fire({
          icon: "success",
          title: "Trabajador actualizado",
          text: "Los datos del trabajador se han actualizado correctamente.",
        });
        onClose();
      })
      .catch((error) => {
        console.error("Error al actualizar trabajador:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo actualizar el trabajador. Inténtelo de nuevo.",
        });
      });
  };

  return (
    <div className="formulario-editar-trabajador">
      <h2 className="titulo-formulario-editar-trabajador">Editar Trabajador</h2>
      <form onSubmit={handleSubmit} className="form-editar-trabajador">
        <div className="campo-formulario-editar-trabajador">
          <label className="label-formulario-editar-trabajador">
            Nombre del Trabajador:
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            placeholder="Nombre para mostrar"
            className="input-editar-trabajador"
          />
        </div>

        <div className="campo-formulario-editar-trabajador">
          <label className="label-formulario-editar-trabajador">
            Especialidad:
          </label>
          <input
            type="text"
            name="especialidad"
            value={formData.especialidad}
            onChange={handleChange}
            placeholder="Ej: Motor, Electricidad, Frenos..."
            className="input-editar-trabajador"
          />
        </div>

        <div className="campo-formulario-editar-trabajador">
          <label className="label-formulario-editar-trabajador">
            Teléfono:
          </label>
          <input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="Número de contacto"
            className="input-editar-trabajador"
          />
        </div>

        <div className="campo-formulario-editar-trabajador">
          <label className="label-formulario-editar-trabajador">
            Fecha de Contratación:
          </label>
          <input
            type="date"
            name="fechaContratacion"
            value={formData.fechaContratacion}
            onChange={handleChange}
            className="input-editar-trabajador"
          />
        </div>

        <div className="campo-checkbox-editar-trabajador">
          <label className="label-checkbox-editar-trabajador">
            <input
              type="checkbox"
              name="activo"
              checked={formData.activo}
              onChange={handleChange}
              className="checkbox-editar-trabajador"
            />
            Trabajador Activo
          </label>
        </div>

        <div className="contenedor-botones-editar-trabajador">
          <button type="submit" className="boton-guardar-cambios-trabajador">
            Guardar Cambios
          </button>
          <button
            type="button"
            onClick={onClose}
            className="boton-cancelar-editar-trabajador"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditarTrabajador;
