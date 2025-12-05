import { httpPayPal } from "./http-axios";

class PayPalService {
  /**
   * Crear orden de pago en PayPal
   * @param {Object} orderData - Datos de la orden
   */
  crearOrdenPayPal(orderData) {
    console.log("💰 Creando orden de PayPal:", orderData);
    
    return httpPayPal.post("/create-order", orderData)
      .then((response) => {
        console.log("✅ Orden de PayPal creada:", response.data);
        return response.data;
      })
      .catch((error) => {
        console.error("❌ Error al crear orden de PayPal:", error.response?.data || error.message);
        throw error;
      });
  }

  /**
   * Capturar pago de PayPal
   * @param {string} orderID - ID de la orden
   */
  capturarPagoPayPal(orderID) {
    console.log("💰 Capturando pago PayPal, OrderID:", orderID);
    
    return httpPayPal.post(`/capture-order/${orderID}`)
      .then((response) => {
        console.log("Pago de PayPal capturado:", response.data);
        return response.data;
      })
      .catch((error) => {
        console.error("Error al capturar pago de PayPal:", error.response?.data || error.message);
        throw error;
      });
  }

  /**
   * Verificar estado de pago
   * @param {string} orderID - ID de la orden
   */
  verificarEstadoPago(orderID) {
    console.log("Verificando estado de pago:", orderID);
    
    return httpPayPal.get(`/order/${orderID}`)
      .then((response) => {
        console.log("Estado de pago obtenido:", response.data);
        return response.data;
      })
      .catch((error) => {
        console.error("Error al verificar estado de pago:", error.response?.data || error.message);
        throw error;
      });
  }
}

export default new PayPalService();