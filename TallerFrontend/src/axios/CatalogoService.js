import { httpMarcas, httpModelos, httpAnios } from "./http-axios";

class CatalogoService {
  // MARCAS
  obtenerMarcas() {
    return httpMarcas.get("/")
      .then(res => res)
      .catch(err => {
        console.error("Error al obtener marcas:", err.message);
        throw err;
      });
  }

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

  // MODELOS
  obtenerModelos() {
    return httpModelos.get("/")
      .then(res => res)
      .catch(err => {
        console.error("Error al obtener modelos:", err.message);
        throw err;
      });
  }

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

  // AÑOS
  obtenerAnios() {
    return httpAnios.get("/")
      .then(res => res)
      .catch(err => {
        console.error("Error al obtener años:", err.message);
        throw err;
      });
  }

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
}

export default new CatalogoService();