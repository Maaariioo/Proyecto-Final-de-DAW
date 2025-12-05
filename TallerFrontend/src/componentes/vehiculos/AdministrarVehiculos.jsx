import { useState, useEffect } from "react";
import "../../styles/AdministrarVehiculos.css";
import { CatalogoService } from "../../axios/index.js";
import Swal from "sweetalert2";
import EditarVehiculo from "./EditarVehiculo.jsx";

function AdministrarVehiculos() {
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [anios, setAnios] = useState([]);

  const [vehiculoEditando, setVehiculoEditando] = useState(null);
  const [tipoEditando, setTipoEditando] = useState("");

  const [nuevaMarca, setNuevaMarca] = useState({ nombre: "", slug: "" });
  const [nuevoModelo, setNuevoModelo] = useState({
    model: "",
    slug: "",
    idMarca: "",
  });
  const [nuevoAnio, setNuevoAnio] = useState({ year: "", idModel: "" });

  const [cargando, setCargando] = useState(true);
  const [pestañaActiva, setPestañaActiva] = useState("marcas");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [marcasRes, modelosRes, aniosRes] = await Promise.all([
        CatalogoService.obtenerMarcas(),
        CatalogoService.obtenerModelos(),
        CatalogoService.obtenerAnios(),
      ]);

      setMarcas(marcasRes?.data || []);
      setModelos(modelosRes?.data || []);
      setAnios(aniosRes?.data || []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      Swal.fire("Error", "No se pudieron cargar los datos", "error");
      setMarcas([]);
      setModelos([]);
      setAnios([]);
    } finally {
      setCargando(false);
    }
  };

  // MARCAS
  const crearMarca = async () => {
    if (!nuevaMarca.nombre.trim()) {
      Swal.fire("Error", "El nombre de la marca es obligatorio", "warning");
      return;
    }

    try {
      const slug =
        nuevaMarca.slug || nuevaMarca.nombre.toLowerCase().replace(/\s+/g, "-");
      await CatalogoService.añadirMarca({
        nombre: nuevaMarca.nombre,
        slug: slug,
      });

      Swal.fire("Éxito", "Marca creada correctamente", "success");
      setNuevaMarca({ nombre: "", slug: "" });
      cargarDatos();
    } catch (error) {
      console.error("Error al crear marca:", error);
      Swal.fire("Error", "No se pudo crear la marca", "error");
    }
  };

  const abrirEditarMarca = (marca) => {
    setVehiculoEditando(marca);
    setTipoEditando("marca");
  };

  // MODELOS
  const crearModelo = async () => {
    if (!nuevoModelo.model.trim() || !nuevoModelo.idMarca) {
      Swal.fire(
        "Error",
        "El nombre del modelo y la marca son obligatorios",
        "warning"
      );
      return;
    }

    try {
      const slug =
        nuevoModelo.slug ||
        nuevoModelo.model.toLowerCase().replace(/\s+/g, "-");
      await CatalogoService.añadirModelo({
        model: nuevoModelo.model,
        slug: slug,
        idMarca: parseInt(nuevoModelo.idMarca),
      });

      Swal.fire("Éxito", "Modelo creado correctamente", "success");
      setNuevoModelo({ model: "", slug: "", idMarca: "" });
      cargarDatos();
    } catch (error) {
      console.error("Error al crear modelo:", error);
      Swal.fire("Error", "No se pudo crear el modelo", "error");
    }
  };

  const abrirEditarModelo = (modelo) => {
    setVehiculoEditando(modelo);
    setTipoEditando("modelo");
  };

  // AÑOS
  const crearAnio = async () => {
    if (!nuevoAnio.year || !nuevoAnio.idModel) {
      Swal.fire("Error", "El año y el modelo son obligatorios", "warning");
      return;
    }

    try {
      await CatalogoService.añadirAnio({
        year: parseInt(nuevoAnio.year),
        idModel: parseInt(nuevoAnio.idModel),
      });

      Swal.fire("Éxito", "Año creado correctamente", "success");
      setNuevoAnio({ year: "", idModel: "" });
      cargarDatos();
    } catch (error) {
      console.error("Error al crear año:", error);
      Swal.fire("Error", "No se pudo crear el año", "error");
    }
  };

  const abrirEditarAnio = (anio) => {
    setVehiculoEditando(anio);
    setTipoEditando("anio");
  };

  // ELIMINAR
  const eliminarMarca = async (id, nombre) => {
    const result = await Swal.fire({
      title: `¿Eliminar marca ${nombre}?`,
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const modelosDeMarca = modelos.filter((m) => m.idMarca === id);
        if (modelosDeMarca.length > 0) {
          Swal.fire(
            "Error",
            `No se puede eliminar la marca porque tiene ${modelosDeMarca.length} modelo(s) asociado(s)`,
            "error"
          );
          return;
        }

        await CatalogoService.eliminarMarca(id);
        Swal.fire("Eliminada", "Marca eliminada correctamente", "success");
        cargarDatos();
      } catch (error) {
        console.error("Error al eliminar marca:", error);
        Swal.fire("Error", "No se pudo eliminar la marca", "error");
      }
    }
  };

  const eliminarModelo = async (id, nombre) => {
    const result = await Swal.fire({
      title: `¿Eliminar modelo ${nombre}?`,
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const añosDelModelo = anios.filter((a) => a.idModel === id);
        if (añosDelModelo.length > 0) {
          Swal.fire(
            "Error",
            `No se puede eliminar el modelo porque tiene ${añosDelModelo.length} año(s) asociado(s)`,
            "error"
          );
          return;
        }

        await CatalogoService.eliminarModelo(id);
        Swal.fire("Eliminado", "Modelo eliminado correctamente", "success");
        cargarDatos();
      } catch (error) {
        console.error("Error al eliminar modelo:", error);
        Swal.fire("Error", "No se pudo eliminar el modelo", "error");
      }
    }
  };

  const eliminarAnio = async (id, year) => {
    const result = await Swal.fire({
      title: `¿Eliminar año ${year}?`,
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await CatalogoService.eliminarAnio(id);
        Swal.fire("Eliminado", "Año eliminado correctamente", "success");
        cargarDatos();
      } catch (error) {
        console.error("Error al eliminar año:", error);
        Swal.fire("Error", "No se pudo eliminar el año", "error");
      }
    }
  };

  const cerrarModal = () => {
    setVehiculoEditando(null);
    setTipoEditando("");
  };

  const onGuardarExitoso = () => {
    cerrarModal();
    cargarDatos();
  };

  if (cargando) {
    return (
      <div className="admin-vehiculos-cargando">
        <div className="admin-vehiculos-spinner"></div>
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="admin-vehiculos-container">
      <div className="admin-vehiculos-header">
        <h1>Administrar Vehículos</h1>
        <p>Gestiona marcas, modelos y años de los vehículos</p>
      </div>

      <div className="admin-vehiculos-pestañas">
        <button
          className={`admin-vehiculos-pestaña ${
            pestañaActiva === "marcas" ? "admin-vehiculos-pestaña-activa" : ""
          }`}
          onClick={() => setPestañaActiva("marcas")}
        >
          Marcas ({marcas.length})
        </button>
        <button
          className={`admin-vehiculos-pestaña ${
            pestañaActiva === "modelos" ? "admin-vehiculos-pestaña-activa" : ""
          }`}
          onClick={() => setPestañaActiva("modelos")}
        >
          Modelos ({modelos.length})
        </button>
        <button
          className={`admin-vehiculos-pestaña ${
            pestañaActiva === "anios" ? "admin-vehiculos-pestaña-activa" : ""
          }`}
          onClick={() => setPestañaActiva("anios")}
        >
          Años ({anios.length})
        </button>
      </div>

      {/* PESTAÑA MARCAS */}
      {pestañaActiva === "marcas" && (
        <div className="admin-vehiculos-pestaña-contenido">
          <div className="admin-vehiculos-formulario-agregar">
            <h3>Agregar Nueva Marca</h3>
            <div className="admin-vehiculos-form-campos">
              <input
                type="text"
                placeholder="Nombre de la marca"
                value={nuevaMarca.nombre}
                onChange={(e) =>
                  setNuevaMarca({ ...nuevaMarca, nombre: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Slug (opcional)"
                value={nuevaMarca.slug}
                onChange={(e) =>
                  setNuevaMarca({ ...nuevaMarca, slug: e.target.value })
                }
              />
            </div>
            <div className="admin-vehiculos-form-acciones">
              <button
                className="admin-vehiculos-btn-agregar"
                onClick={crearMarca}
              >
                Agregar Marca
              </button>
            </div>
          </div>

          <div className="admin-vehiculos-lista-items">
            <h3>Marcas Existentes</h3>
            {marcas.length === 0 ? (
              <p className="admin-vehiculos-sin-datos">
                No hay marcas registradas
              </p>
            ) : (
              marcas.map((marca) => (
                <div key={marca.id} className="admin-vehiculos-item-tarjeta">
                  <div className="admin-vehiculos-item-info">
                    <h4>{marca.nombre}</h4>
                    <p>Slug: {marca.slug}</p>
                    <p>
                      Modelos:{" "}
                      {modelos.filter((m) => m.idMarca === marca.id).length}
                    </p>
                  </div>
                  <div className="admin-vehiculos-item-acciones">
                    <button
                      className="admin-vehiculos-btn-editar"
                      onClick={() => abrirEditarMarca(marca)}
                    >
                      Editar
                    </button>
                    <button
                      className="admin-vehiculos-btn-eliminar"
                      onClick={() => eliminarMarca(marca.id, marca.nombre)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* PESTAÑA MODELOS */}
      {pestañaActiva === "modelos" && (
        <div className="admin-vehiculos-pestaña-contenido">
          <div className="admin-vehiculos-formulario-agregar">
            <h3>Agregar Nuevo Modelo</h3>
            <div className="admin-vehiculos-form-campos">
              <select
                value={nuevoModelo.idMarca}
                onChange={(e) =>
                  setNuevoModelo({ ...nuevoModelo, idMarca: e.target.value })
                }
              >
                <option value="">Seleccionar Marca</option>
                {marcas.map((marca) => (
                  <option key={marca.id} value={marca.id}>
                    {marca.nombre}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Nombre del modelo"
                value={nuevoModelo.model}
                onChange={(e) =>
                  setNuevoModelo({ ...nuevoModelo, model: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Slug (opcional)"
                value={nuevoModelo.slug}
                onChange={(e) =>
                  setNuevoModelo({ ...nuevoModelo, slug: e.target.value })
                }
              />
            </div>
            <div className="admin-vehiculos-form-acciones">
              <button
                className="admin-vehiculos-btn-agregar"
                onClick={crearModelo}
              >
                Agregar Modelo
              </button>
            </div>
          </div>

          <div className="admin-vehiculos-lista-items">
            <h3>Modelos Existentes</h3>
            {modelos.length === 0 ? (
              <p className="admin-vehiculos-sin-datos">
                No hay modelos registrados
              </p>
            ) : (
              modelos.map((modelo) => {
                const marca = marcas.find((m) => m.id === modelo.idMarca);
                return (
                  <div key={modelo.id} className="admin-vehiculos-item-tarjeta">
                    <div className="admin-vehiculos-item-info">
                      <h4>{modelo.model}</h4>
                      <p>Marca: {marca?.nombre || "Marca no encontrada"}</p>
                      <p>Slug: {modelo.slug}</p>
                      <p>
                        Años:{" "}
                        {anios.filter((a) => a.idModel === modelo.id).length}
                      </p>
                    </div>
                    <div className="admin-vehiculos-item-acciones">
                      <button
                        className="admin-vehiculos-btn-editar"
                        onClick={() => abrirEditarModelo(modelo)}
                      >
                        Editar
                      </button>
                      <button
                        className="admin-vehiculos-btn-eliminar"
                        onClick={() => eliminarModelo(modelo.id, modelo.model)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* PESTAÑA AÑOS */}
      {pestañaActiva === "anios" && (
        <div className="admin-vehiculos-pestaña-contenido">
          <div className="admin-vehiculos-formulario-agregar">
            <h3>Agregar Nuevo Año</h3>
            <div className="admin-vehiculos-form-campos">
              <select
                value={nuevoAnio.idModel}
                onChange={(e) =>
                  setNuevoAnio({ ...nuevoAnio, idModel: e.target.value })
                }
              >
                <option value="">Seleccionar Modelo</option>
                {modelos.map((modelo) => {
                  const marca = marcas.find((m) => m.id === modelo.idMarca);
                  return (
                    <option key={modelo.id} value={modelo.id}>
                      {marca?.nombre} - {modelo.model}
                    </option>
                  );
                })}
              </select>
              <input
                type="number"
                placeholder="Año (ej: 2023)"
                min="1900"
                max="2030"
                value={nuevoAnio.year}
                onChange={(e) =>
                  setNuevoAnio({ ...nuevoAnio, year: e.target.value })
                }
              />
            </div>
            <div className="admin-vehiculos-form-acciones">
              <button
                className="admin-vehiculos-btn-agregar"
                onClick={crearAnio}
              >
                Agregar Año
              </button>
            </div>
          </div>

          <div className="admin-vehiculos-lista-items">
            <h3>Años Existentes</h3>
            {anios.length === 0 ? (
              <p className="admin-vehiculos-sin-datos">
                No hay años registrados
              </p>
            ) : (
              anios.map((anio) => {
                const modelo = modelos.find((m) => m.id === anio.idModel);
                const marca = modelo
                  ? marcas.find((m) => m.id === modelo.idMarca)
                  : null;
                return (
                  <div key={anio.id} className="admin-vehiculos-item-tarjeta">
                    <div className="admin-vehiculos-item-info">
                      <h4>{anio.year}</h4>
                      <p>Modelo: {modelo?.model || "Desconocido"}</p>
                      <p>Marca: {marca?.nombre || "Desconocida"}</p>
                    </div>
                    <div className="admin-vehiculos-item-acciones">
                      <button
                        className="admin-vehiculos-btn-editar"
                        onClick={() => abrirEditarAnio(anio)}
                      >
                        Editar
                      </button>
                      <button
                        className="admin-vehiculos-btn-eliminar"
                        onClick={() => eliminarAnio(anio.id, anio.year)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* MODAL DE EDICIÓN */}
      {vehiculoEditando && (
        <EditarVehiculo
          vehiculo={vehiculoEditando}
          tipo={tipoEditando}
          marcas={marcas}
          modelos={modelos}
          onClose={cerrarModal}
          onGuardarExitoso={onGuardarExitoso}
        />
      )}
    </div>
  );
}

export default AdministrarVehiculos;
