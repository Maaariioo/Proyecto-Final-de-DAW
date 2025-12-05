import { httpServicios } from "./http-axios";

class ServicioService {
  obtenerServicios() {
    return httpServicios.get("/")
      .then(res => res)
      .catch(err => {
        console.error("Error al obtener servicios:", err.message);
        throw err;
      });
  }

  añadirServicio(data) {
    console.log("Añadiendo servicio:", data);
    return httpServicios.post("/", data)
      .then(res => res)
      .catch(err => {
        console.error("Error al añadir servicio:", err.response?.data || err.message);
        throw err;
      });
  }

  actualizarServicio(id, data) {
    console.log("Actualizando servicio ID:", id);
    return httpServicios.patch(`/${id}`, data)
      .then(res => {
        console.log("Servicio actualizado:", res.data);
        return res;
      })
      .catch(err => {
        console.error("Error al actualizar servicio:", err.response?.data || err.message);
        throw err;
      });
  }

  borrarServicio(id) {
    console.log("Borrando servicio ID:", id);
    return httpServicios.delete(`/${id}`)
      .then(res => res)
      .catch(err => {
        console.error("Error al borrar servicio:", err.response?.data || err.message);
        throw err;
      });
  }
}

export default new ServicioService();