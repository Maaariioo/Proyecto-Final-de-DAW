import { useState, useEffect } from "react";
import "../../styles/EditarVehiculo.css";
import { CatalogoService } from "../../axios/index.js"; // Import corregido
import Swal from "sweetalert2";

function EditarVehiculo({
  vehiculo,
  tipo,
  marcas,
  modelos,
  onClose,
  onGuardarExitoso,
}) {
  const [formData, setFormData] = useState({});
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (vehiculo) {
      const { id, ...datosSinId } = vehiculo;
      setFormData(datosSinId);
      console.log("📥 Datos del vehículo recibidos:", vehiculo);
    }
  }, [vehiculo]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    let valorFinal = value;

    if (name === "idMarca" || name === "idModel" || name === "year") {
      valorFinal = value === "" ? "" : parseInt(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: valorFinal,
    }));
  };

  const validarFormulario = () => {
    switch (tipo) {
      case "marca":
        if (!formData.nombre?.trim()) {
          Swal.fire("Error", "El nombre de la marca es obligatorio", "warning");
          return false;
        }
        break;
      case "modelo":
        if (!formData.model?.trim()) {
          Swal.fire("Error", "El nombre del modelo es obligatorio", "warning");
          return false;
        }
        if (!formData.idMarca) {
          Swal.fire("Error", "Debe seleccionar una marca", "warning");
          return false;
        }

        if (!formData.slug?.trim()) {
          setFormData((prev) => ({
            ...prev,
            slug: formData.model.toLowerCase().replace(/\s+/g, "-"),
          }));
        }
        break;
      case "anio":
        if (!formData.year || formData.year < 1900 || formData.year > 2030) {
          Swal.fire("Error", "El año debe estar entre 1900 y 2030", "warning");
          return false;
        }
        if (!formData.idModel) {
          Swal.fire("Error", "Debe seleccionar un modelo", "warning");
          return false;
        }
        break;
      default:
        return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setGuardando(true);

    try {
      const datosParaEnviar = { ...formData };

      if (
        tipo === "modelo" &&
        (!datosParaEnviar.slug || datosParaEnviar.slug.trim() === "")
      ) {
        datosParaEnviar.slug = datosParaEnviar.model
          .toLowerCase()
          .replace(/\s+/g, "-");
      }

      if (
        tipo === "marca" &&
        (!datosParaEnviar.slug || datosParaEnviar.slug.trim() === "")
      ) {
        datosParaEnviar.slug = datosParaEnviar.nombre
          .toLowerCase()
          .replace(/\s+/g, "-");
      }

      console.log("📤 Enviando datos al backend:", {
        tipo,
        id: vehiculo.id,
        datosParaEnviar: JSON.stringify(datosParaEnviar, null, 2),
      });

      let response;
      switch (tipo) {
        case "marca":
          response = await CatalogoService.actualizarMarca(vehiculo.id, {
            nombre: datosParaEnviar.nombre,
            slug: datosParaEnviar.slug,
          });
          break;
        case "modelo":
          response = await CatalogoService.actualizarModelo(vehiculo.id, {
            model: datosParaEnviar.model,
            slug: datosParaEnviar.slug,
            idMarca: datosParaEnviar.idMarca,
          });
          break;
        case "anio":
          response = await CatalogoService.actualizarAnio(vehiculo.id, {
            year: datosParaEnviar.year,
            idModel: datosParaEnviar.idModel,
          });
          break;
        default:
          throw new Error("Tipo de vehículo no válido");
      }

      console.log("Respuesta del servidor:", response.data);

      if (response.data) {
        const vehiculoActualizado = { ...vehiculo, ...response.data };
        onGuardarExitoso(vehiculoActualizado);
      } else {
        onGuardarExitoso();
      }

      Swal.fire(
        "Éxito",
        `${getTipoTexto()} actualizado correctamente`,
        "success"
      );
    } catch (error) {
      console.error(`Error al actualizar ${tipo}:`, error);

      let mensajeError = "Error desconocido";

      if (error.response?.data) {
        mensajeError =
          typeof error.response.data === "string"
            ? error.response.data
            : JSON.stringify(error.response.data);
      } else if (error.message) {
        mensajeError = error.message;
      }

      Swal.fire(
        "Error",
        `No se pudo actualizar el ${getTipoTexto()}: ${mensajeError}`,
        "error"
      );
    } finally {
      setGuardando(false);
    }
  };

  const getTipoTexto = () => {
    switch (tipo) {
      case "marca":
        return "Marca";
      case "modelo":
        return "Modelo";
      case "anio":
        return "Año";
      default:
        return "Vehículo";
    }
  };

  const getTitulo = () => {
    switch (tipo) {
      case "marca":
        return `Editar Marca: ${vehiculo.nombre}`;
      case "modelo":
        return `Editar Modelo: ${vehiculo.model}`;
      case "anio":
        return `Editar Año: ${vehiculo.year}`;
      default:
        return "Editar Vehículo";
    }
  };

  if (!vehiculo) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{getTitulo()}</h2>
          <button className="btn-cerrar-modal" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* FORMULARIO PARA MARCAS */}
          {tipo === "marca" && (
            <>
              <div className="form-grupo">
                <label htmlFor="nombre">Nombre de la marca:</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre || ""}
                  onChange={handleChange}
                  required
                  disabled={guardando}
                />
              </div>

              <div className="form-grupo">
                <label htmlFor="slug">Slug:</label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug || ""}
                  onChange={handleChange}
                  placeholder="Ej: toyota, bmw, mercedes-benz"
                  disabled={guardando}
                  required
                />
                <small className="texto-ayuda">
                  Identificador único para URLs. Campo obligatorio.
                </small>
              </div>
            </>
          )}

          {/* FORMULARIO PARA MODELOS */}
          {tipo === "modelo" && (
            <>
              <div className="form-grupo">
                <label htmlFor="idMarca">Marca:</label>
                <select
                  id="idMarca"
                  name="idMarca"
                  value={formData.idMarca || ""}
                  onChange={handleChange}
                  required
                  disabled={guardando}
                >
                  <option value="">Seleccionar marca</option>
                  {marcas.map((marca) => (
                    <option key={marca.id} value={marca.id}>
                      {marca.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-grupo">
                <label htmlFor="model">Nombre del modelo:</label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model || ""}
                  onChange={handleChange}
                  required
                  disabled={guardando}
                />
              </div>

              <div className="form-grupo">
                <label htmlFor="slug">Slug:</label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug || ""}
                  onChange={handleChange}
                  placeholder="Ej: corolla, serie-3, clase-c"
                  disabled={guardando}
                  required
                />
                <small className="texto-ayuda">
                  Identificador único para URLs. Campo obligatorio.
                </small>
              </div>
            </>
          )}

          {/* FORMULARIO PARA AÑOS */}
          {tipo === "anio" && (
            <>
              <div className="form-grupo">
                <label htmlFor="idModel">Modelo:</label>
                <select
                  id="idModel"
                  name="idModel"
                  value={formData.idModel || ""}
                  onChange={handleChange}
                  required
                  disabled={guardando}
                >
                  <option value="">Seleccionar modelo</option>
                  {modelos.map((modelo) => {
                    const marca = marcas.find((m) => m.id === modelo.idMarca);
                    return (
                      <option key={modelo.id} value={modelo.id}>
                        {marca?.nombre} - {modelo.model}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-grupo">
                <label htmlFor="year">Año:</label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year || ""}
                  onChange={handleChange}
                  min="1900"
                  max="2030"
                  required
                  disabled={guardando}
                />
              </div>
            </>
          )}

          <div className="modal-acciones">
            <button type="submit" className="btn-guardar" disabled={guardando}>
              {guardando ? (
                <>
                  <div className="spinner-mini"></div>
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditarVehiculo;
