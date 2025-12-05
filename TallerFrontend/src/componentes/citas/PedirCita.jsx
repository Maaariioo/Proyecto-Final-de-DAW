import { useState, useEffect } from "react";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import "../../styles/FormularioCita.css";
import Swal from "sweetalert2";
import emailjs from "@emailjs/browser";
import ServicioServicios from "../../axios/ServicioServicios.js";
import CitaService from "../../axios/CitaService.js";

// Componente para manejar el estado de PayPal
function PayPalButtonWrapper({ createOrder, onApprove, onError, onCancel }) {
  const [{ isPending }] = usePayPalScriptReducer();

  if (isPending) {
    return (
      <div className="paypal-loading">
        <div className="loading-spinner"></div>
        <p>Cargando PayPal...</p>
      </div>
    );
  }

  return (
    <PayPalButtons
      style={{
        layout: "vertical",
        shape: "rect",
        color: "gold",
        label: "paypal",
        height: 55,
      }}
      createOrder={createOrder}
      onApprove={onApprove}
      onError={onError}
      onCancel={onCancel}
      fundingSource="paypal"
    />
  );
}

function FormularioCita() {
  const serviceId = "service_ilewpu7";
  const templateId = "template_prnrd2q";
  const publicKey = "GeShWvojA9P2CKA5n";

  // Función para calcular la fecha de Pascua (algoritmo de Gauss)
  const calcularPascua = (year) => {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const n = Math.floor((h + l - 7 * m + 114) / 31);
    const p = (h + l - 7 * m + 114) % 31;

    const mes = n;
    const dia = p + 1;

    return new Date(year, mes - 1, dia);
  };

  // Función para generar festivos nacionales y de Madrid hasta 2028
  const generarFestivos = () => {
    const festivos = [];

    const años = [2025, 2026, 2027, 2028];

    años.forEach((year) => {
      // Festivos fijos nacionales
      const festivosFijos = [
        { fecha: `${year}-01-01`, nombre: "Año Nuevo" },
        { fecha: `${year}-01-06`, nombre: "Reyes Magos" },
        { fecha: `${year}-05-01`, nombre: "Día del Trabajo" },
        { fecha: `${year}-08-15`, nombre: "Asunción de la Virgen" },
        { fecha: `${year}-10-12`, nombre: "Fiesta Nacional de España" },
        { fecha: `${year}-11-01`, nombre: "Todos los Santos" },
        { fecha: `${year}-12-06`, nombre: "Día de la Constitución" },
        { fecha: `${year}-12-08`, nombre: "Inmaculada Concepción" },
        { fecha: `${year}-12-25`, nombre: "Navidad" },
      ];

      // Festivos fijos de Madrid
      const festivosMadrid = [
        { fecha: `${year}-05-02`, nombre: "Fiesta de la Comunidad de Madrid" },
        { fecha: `${year}-05-15`, nombre: "San Isidro Labrador" },
      ];

      // Festivos móviles (Semana Santa)
      const pascua = calcularPascua(year);
      const juevesSanto = new Date(pascua);
      juevesSanto.setDate(pascua.getDate() - 3);
      const viernesSanto = new Date(pascua);
      viernesSanto.setDate(pascua.getDate() - 2);

      const festivosMoviles = [
        {
          fecha: juevesSanto.toISOString().split("T")[0],
          nombre: "Jueves Santo",
        },
        {
          fecha: viernesSanto.toISOString().split("T")[0],
          nombre: "Viernes Santo",
        },
      ];

      festivos.push(...festivosFijos, ...festivosMadrid, ...festivosMoviles);
    });

    return festivos;
  };

  const festivosNacionales = generarFestivos();

  // Generar todas las horas posibles del horario laboral
  const generarTodasLasHoras = () => {
    const horas = [];
    for (let hora = 8; hora <= 14; hora++) {
      horas.push(`${hora.toString().padStart(2, "0")}:00`);
    }
    for (let hora = 16; hora <= 18; hora++) {
      horas.push(`${hora.toString().padStart(2, "0")}:00`);
    }
    return horas;
  };

  const todasLasHoras = generarTodasLasHoras();
  const [horasDisponibles, setHorasDisponibles] = useState(todasLasHoras);

  const [marcas, setMarcas] = useState([]);
  const [modelosTodos, setModelosTodos] = useState([]);
  const [modelosFiltrados, setModelosFiltrados] = useState([]);
  const [aniosTodos, setAniosTodos] = useState([]);
  const [aniosFiltrados, setAniosFiltrados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [consultandoHoras, setConsultandoHoras] = useState(false);

  // Estados para autocompletar
  const [mostrarSugerencias, setMostrarSugerencias] = useState({
    marca: false,
    modelo: false,
    anio: false,
  });

  // Estados para el pago
  const [pagoCompletado, setPagoCompletado] = useState(false);
  const [mostrarPayPal, setMostrarPayPal] = useState(false);
  const [formularioValido, setFormularioValido] = useState(false);
  const [procesandoPago, setProcesandoPago] = useState(false);

  const formVacio = {
    nombre: "",
    telefono: "",
    correo: "",
    marca: "",
    modelo: "",
    matricula: "",
    fecha: "",
    hora: "",
    descripcion: "",
    anio: "",
  };

  const [form, setForm] = useState(formVacio);
  const [errores, setErrores] = useState({});

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // Consultar horas disponibles cuando cambia la fecha
  useEffect(() => {
    if (form.fecha) {
      consultarHorasDisponibles(form.fecha);
    }
  }, [form.fecha]);

  const cargarDatosIniciales = async () => {
    try {
      setCargando(true);

      const [marcasRes, modelosRes, aniosRes] = await Promise.all([
        ServicioServicios.obtenerMarcas(),
        ServicioServicios.obtenerModelos(),
        ServicioServicios.obtenerAnios(),
      ]);

      setMarcas(marcasRes.data);
      setModelosTodos(modelosRes.data);

      if (aniosRes.data && Array.isArray(aniosRes.data)) {
        setAniosTodos(aniosRes.data);
      }
    } catch (error) {
      console.error("Error cargando datos iniciales:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los datos del formulario.",
      });
    } finally {
      setCargando(false);
    }
  };

  // Función para verificar si una fecha es fin de semana
  const esFinDeSemana = (fecha) => {
    if (!fecha) return false;
    const fechaObj = new Date(fecha);
    const diaSemana = fechaObj.getDay();
    return diaSemana === 0 || diaSemana === 6;
  };

  // Función para verificar si una fecha es festivo
  const esFestivo = (fecha) => {
    if (!fecha) return false;
    return festivosNacionales.some((festivo) => festivo.fecha === fecha);
  };

  // Función para obtener el nombre del festivo
  const obtenerNombreFestivo = (fecha) => {
    const festivo = festivosNacionales.find((f) => f.fecha === fecha);
    return festivo ? festivo.nombre : "Festivo";
  };

  // Función para consultar horas disponibles desde la API
  const consultarHorasDisponibles = async (fecha) => {
    try {
      setConsultandoHoras(true);

      // Validar si es fin de semana o festivo
      if (esFinDeSemana(fecha) || esFestivo(fecha)) {
        setHorasDisponibles([]);
        setConsultandoHoras(false);
        return;
      }

      // Consultar horas disponibles en la API
      const response = await CitaService.obtenerHorasDisponibles(fecha);

      if (response.data && Array.isArray(response.data)) {
        setHorasDisponibles(response.data);
      } else {
        setHorasDisponibles(todasLasHoras);
      }
    } catch (error) {
      console.error("Error consultando horas disponibles:", error);
      setHorasDisponibles(todasLasHoras);
    } finally {
      setConsultandoHoras(false);
    }
  };

  // Función para obtener sugerencias de autocompletar
  const obtenerSugerencias = (campo, valor) => {
    if (!valor || valor.length < 1) return [];

    const valorLower = valor.toLowerCase();

    switch (campo) {
      case "marca":
        return marcas
          .filter(
            (m) => m.nombre && m.nombre.toLowerCase().includes(valorLower)
          )
          .slice(0, 8);
      case "modelo":
        return modelosFiltrados.length > 0
          ? modelosFiltrados
              .filter(
                (m) => m.model && m.model.toLowerCase().includes(valorLower)
              )
              .slice(0, 8)
          : modelosTodos
              .filter(
                (m) => m.model && m.model.toLowerCase().includes(valorLower)
              )
              .slice(0, 8);
      case "anio":
        return aniosFiltrados.length > 0
          ? aniosFiltrados
              .filter((a) => a.year && a.year.toString().includes(valor))
              .slice(0, 8)
          : aniosTodos
              .filter((a) => a.year && a.year.toString().includes(valor))
              .slice(0, 8);
      default:
        return [];
    }
  };

  // Función para enviar email de confirmación
  const enviarEmailConfirmacion = async (templateParams) => {
    try {
      const response = await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        publicKey
      );
      console.log("Email enviado exitosamente:", response);
      return response;
    } catch (error) {
      console.error("Error al enviar email:", error);
    }
  };

  const gestionarCambio = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Mostrar sugerencias cuando el usuario empieza a escribir
    if (["marca", "modelo", "anio"].includes(name)) {
      setMostrarSugerencias((prev) => ({
        ...prev,
        [name]: value.length >= 1,
      }));
    }

    // Si cambia la fecha, limpiar la hora seleccionada
    if (name === "fecha") {
      setForm((prev) => ({ ...prev, hora: "" }));

      // Mostrar error si es fin de semana o festivo
      if (esFinDeSemana(value) || esFestivo(value)) {
        let mensajeError = "";
        if (esFinDeSemana(value)) {
          mensajeError =
            "No se pueden agendar citas los fines de semana. Por favor, seleccione un día entre lunes y viernes.";
        } else {
          const nombreFestivo = obtenerNombreFestivo(value);
          mensajeError = `No se pueden agendar citas en días festivos. ${nombreFestivo}. Por favor, seleccione otro día.`;
        }

        setErrores((prev) => ({
          ...prev,
          fecha: mensajeError,
        }));
      } else {
        setErrores((prev) => {
          const nuevosErrores = { ...prev };
          delete nuevosErrores.fecha;
          return nuevosErrores;
        });
      }
    }

    if (name === "marca") {
      // Buscar si la marca existe en la lista
      const marcaSeleccionada = marcas.find((m) => m.nombre === value);

      if (marcaSeleccionada) {
        // Si existe, filtrar modelos
        const modelosFiltrados = modelosTodos.filter(
          (modelo) => modelo.idMarca === marcaSeleccionada.id
        );
        setModelosFiltrados(modelosFiltrados);
      } else {
        // Si no existe, permitir cualquier valor pero no filtrar
        setModelosFiltrados([]);
      }

      // Limpiar modelo y año cuando cambia la marca
      setForm((prev) => ({ ...prev, modelo: "", anio: "" }));
      setAniosFiltrados([]);
    }

    if (name === "modelo") {
      // Buscar si el modelo existe en la lista filtrada
      const modeloSeleccionado = modelosFiltrados.find(
        (m) => m.model === value
      );

      if (modeloSeleccionado) {
        // Si existe en la lista filtrada, filtrar años
        const aniosFiltrados = aniosTodos.filter(
          (a) => a.idModel === modeloSeleccionado.id
        );
        setAniosFiltrados(aniosFiltrados);
      } else {
        // Si no existe, permitir cualquier valor
        setAniosFiltrados([]);
      }

      // Limpiar año cuando cambia el modelo
      setForm((prev) => ({ ...prev, anio: "" }));
    }

    // Validar formulario en tiempo real
    setTimeout(() => {
      const esValido = validarFormulario(true);
      setFormularioValido(esValido);
    }, 100);
  };

  // Función para seleccionar una sugerencia
  const seleccionarSugerencia = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setMostrarSugerencias((prev) => ({ ...prev, [campo]: false }));

    // Si se selecciona una marca válida, filtrar modelos
    if (campo === "marca") {
      const marcaSeleccionada = marcas.find((m) => m.nombre === valor);
      if (marcaSeleccionada) {
        const modelosFiltrados = modelosTodos.filter(
          (modelo) => modelo.idMarca === marcaSeleccionada.id
        );
        setModelosFiltrados(modelosFiltrados);
      } else {
        setModelosFiltrados([]);
      }
      setForm((prev) => ({ ...prev, modelo: "", anio: "" }));
      setAniosFiltrados([]);
    }

    // Si se selecciona un modelo válido, filtrar años
    if (campo === "modelo" && modelosFiltrados.length > 0) {
      const modeloSeleccionado = modelosFiltrados.find(
        (m) => m.model === valor
      );
      if (modeloSeleccionado) {
        const aniosFiltrados = aniosTodos.filter(
          (a) => a.idModel === modeloSeleccionado.id
        );
        setAniosFiltrados(aniosFiltrados);
      }
    }
  };

  // Función para manejar el blur (cuando el usuario sale del campo)
  const manejarBlur = (campo) => {
    setTimeout(() => {
      setMostrarSugerencias((prev) => ({ ...prev, [campo]: false }));
    }, 200);
  };

  // Función para manejar el focus (cuando el usuario entra al campo)
  const manejarFocus = (campo) => {
    const valor = form[campo];
    if (valor && valor.length >= 1) {
      setMostrarSugerencias((prev) => ({ ...prev, [campo]: true }));
    }
  };

  const validarFormulario = (silent = false) => {
    const nuevosErrores = {};

    if (!form.nombre.trim()) nuevosErrores.nombre = "El nombre es obligatorio";
    if (!form.telefono.trim())
      nuevosErrores.telefono = "El teléfono es obligatorio";
    if (!form.correo.trim()) nuevosErrores.correo = "El correo es obligatorio";
    if (!form.marca.trim()) nuevosErrores.marca = "La marca es obligatoria";
    if (!form.modelo.trim()) nuevosErrores.modelo = "El modelo es obligatorio";
    if (!form.matricula.trim())
      nuevosErrores.matricula = "La matrícula es obligatoria";

    // Validación especial para fecha
    if (!form.fecha.trim()) {
      nuevosErrores.fecha = "La fecha es obligatoria";
    } else if (esFinDeSemana(form.fecha) || esFestivo(form.fecha)) {
      if (esFinDeSemana(form.fecha)) {
        nuevosErrores.fecha =
          "No se pueden agendar citas los fines de semana. Por favor, seleccione un día entre lunes y viernes.";
      } else {
        const nombreFestivo = obtenerNombreFestivo(form.fecha);
        nuevosErrores.fecha = `No se pueden agendar citas en días festivos. ${nombreFestivo}. Por favor, seleccione otro día.`;
      }
    }

    if (!form.hora.trim()) nuevosErrores.hora = "La hora es obligatoria";
    if (!form.descripcion.trim())
      nuevosErrores.descripcion = "La descripción es obligatoria";
    if (!form.anio.trim()) nuevosErrores.anio = "El año es obligatorio";

    if (!silent) {
      setErrores(nuevosErrores);
    }

    return Object.keys(nuevosErrores).length === 0;
  };

  const mostrarFormularioPago = (e) => {
    e.preventDefault();

    // Validación adicional para fin de semana o festivo
    if (form.fecha && (esFinDeSemana(form.fecha) || esFestivo(form.fecha))) {
      let mensaje = "";
      if (esFinDeSemana(form.fecha)) {
        mensaje =
          "No se pueden agendar citas los fines de semana. Por favor, seleccione un día entre lunes y viernes.";
      } else {
        const nombreFestivo = obtenerNombreFestivo(form.fecha);
        mensaje = `No se pueden agendar citas en días festivos. ${nombreFestivo}. Por favor, seleccione otro día.`;
      }

      Swal.fire({
        icon: "error",
        title: "Fecha no válida",
        text: mensaje,
        confirmButtonColor: "#d33",
      });
      return;
    }

    if (validarFormulario()) {
      setMostrarPayPal(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      Swal.fire({
        icon: "error",
        title: "Formulario incompleto",
        text: "Por favor, complete todos los campos requeridos correctamente.",
      });
    }
  };

  const crearOrden = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: "10.00",
            currency_code: "EUR",
            breakdown: {
              item_total: {
                value: "10.00",
                currency_code: "EUR",
              },
            },
          },
          items: [
            {
              name: "Reserva de Cita - Taller Mecánico",
              description:
                "Depósito de reserva para cita en taller. Se descontará del precio final.",
              quantity: "1",
              unit_amount: {
                value: "10.00",
                currency_code: "EUR",
              },
            },
          ],
        },
      ],
      application_context: {
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        brand_name: "Taller Mecánico AutoPro",
      },
    });
  };

  const procesarAprobacion = async (data, actions) => {
    try {
      const details = await actions.order.capture();
      await procesarCita(details);
    } catch (error) {
      console.error("Error capturando el pago:", error);
      Swal.fire({
        icon: "error",
        title: "Error en el pago",
        text: "No se pudo procesar el pago. Por favor, intente de nuevo.",
      });
    }
  };

  const procesarCita = async (datosPago = null) => {
    setProcesandoPago(true);

    try {
      // Usar CitaService
      const citaRegistrada = await CitaService.procesarCitaConPago(
        form,
        datosPago
      );

      const templateParametros = {
        nombre: form.nombre,
        email: form.correo,
        telefono: form.telefono,
        marca: form.marca,
        modelo: form.modelo,
        matricula: form.matricula,
        fecha: form.fecha,
        hora: form.hora,
        descripcion: form.descripcion,
        year: form.anio,
        id_cita: citaRegistrada.data?.id || "N/A",
        deposito: datosPago ? "10.00€" : "0.00€",
      };

      // Enviar email de confirmación
      await enviarEmailConfirmacion(templateParametros);

      setPagoCompletado(true);

      Swal.fire({
        title: "¡Cita Confirmada!",
        html: `
          <div style="text-align: left;">
            <p><strong>Resumen de su cita:</strong></p>
            <p>📅 <strong>Fecha:</strong> ${form.fecha} a las ${form.hora}</p>
            <p>👤 <strong>Cliente:</strong> ${form.nombre}</p>
            <p>🚗 <strong>Vehículo:</strong> ${form.marca} ${form.modelo} (${form.matricula})</p>
            <p><strong>Depósito pagado:</strong> 10.00€</p>
            <p>📧 <strong>Recibirá un email de confirmación</strong></p>
          </div>
        `,
        icon: "success",
        confirmButtonText: "Entendido",
      });
    } catch (error) {
      console.error("Error al registrar la cita:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo registrar la cita. Por favor, contacte con el taller.",
      });
    } finally {
      setProcesandoPago(false);
    }
  };

  const manejarErrorPayPal = (err) => {
    console.error("Error de PayPal:", err);
    Swal.fire({
      icon: "error",
      title: "Error de pago",
      text: "Ocurrió un error con PayPal. Por favor, intente con otro método de pago.",
    });
  };

  const cancelarPago = () => {
    setMostrarPayPal(false);
    Swal.fire({
      title: "Pago cancelado",
      text: "Puede completar el formulario y intentar de nuevo cuando esté listo.",
      icon: "info",
      confirmButtonText: "Entendido",
    });
  };

  const solicitarNuevaCita = () => {
    setPagoCompletado(false);
    setMostrarPayPal(false);
    setForm(formVacio);
    setErrores({});
    setModelosFiltrados([]);
    setAniosFiltrados([]);
    setMostrarSugerencias({ marca: false, modelo: false, anio: false });
    setHorasDisponibles(todasLasHoras);
  };

  // Función para obtener el tipo de día
  const obtenerTipoDia = (fecha) => {
    if (!fecha) return "";

    if (esFestivo(fecha)) {
      const nombreFestivo = obtenerNombreFestivo(fecha);
      return `❌ ${nombreFestivo}`;
    } else if (esFinDeSemana(fecha)) {
      return "❌ Fin de semana";
    } else {
      return `✅ ${new Date(fecha).toLocaleDateString("es-ES", {
        weekday: "long",
      })} laborable`;
    }
  };

  if (cargando) {
    return (
      <div className="fullscreen-form-container">
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Cargando formulario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fullscreen-form-container">
      <div className="form-background">
        <div className="form-content">
          {mostrarPayPal && !pagoCompletado && (
            <div className="payment-banner">
              <div className="payment-info">
                <h3>Reserva de Cita - 10.00€</h3>
                <p>
                  Este depósito se descontará del precio final de la reparación
                </p>
              </div>
            </div>
          )}

          {pagoCompletado ? (
            <div className="success-container">
              <div className="success-icon">✅</div>
              <h2>¡Cita Confirmada!</h2>
              <p>
                Su cita ha sido registrada exitosamente. El depósito de 10.00€
                ha sido aplicado.
              </p>
              <div className="appointment-summary">
                <h4>Resumen de su cita:</h4>
                <p>
                  <strong>Fecha:</strong> {form.fecha} a las {form.hora}
                </p>
                <p>
                  <strong>Vehículo:</strong> {form.marca} {form.modelo}
                </p>
                <p>
                  <strong>Matrícula:</strong> {form.matricula}
                </p>
              </div>
              <button
                className="btn-new-appointment"
                onClick={solicitarNuevaCita}
              >
                Solicitar Nueva Cita
              </button>
            </div>
          ) : (
            <form id="formularioCita" onSubmit={mostrarFormularioPago}>
              <div className="form-header">
                <h2>SOLICITUD DE CITA</h2>
                <p className="form-subtitle">
                  Programe su visita a nuestro taller especializado
                </p>
                <div className="deposit-info">
                  <span className="deposit-badge">
                    Pagar 10.00€ para la cita
                  </span>
                  <br></br>
                  <small>Se descontará del precio final del trabajo</small>
                </div>
              </div>

              {mostrarPayPal && (
                <div className="paypal-section">
                  <h3>Pago de Reserva</h3>
                  <div className="paypal-container">
                    <PayPalButtonWrapper
                      createOrder={crearOrden}
                      onApprove={procesarAprobacion}
                      onError={manejarErrorPayPal}
                      onCancel={cancelarPago}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-cancel-payment"
                    onClick={cancelarPago}
                  >
                    ← Volver al formulario
                  </button>
                </div>
              )}

              {!mostrarPayPal && (
                <>
                  <div className="form-sections">
                    <div className="form-section">
                      <h3>Datos Personales</h3>
                      <div className="form-group">
                        <input
                          name="nombre"
                          type="text"
                          id="nombre"
                          placeholder="Nombre completo"
                          onChange={gestionarCambio}
                          value={form.nombre}
                        />
                        {errores.nombre && (
                          <p className="errores">{errores.nombre}</p>
                        )}
                      </div>
                      <div className="form-group">
                        <input
                          name="telefono"
                          type="tel"
                          id="telefono"
                          placeholder="Teléfono de contacto"
                          onChange={gestionarCambio}
                          value={form.telefono}
                        />
                        {errores.telefono && (
                          <p className="errores">{errores.telefono}</p>
                        )}
                      </div>
                      <div className="form-group">
                        <input
                          name="correo"
                          type="text"
                          id="correo"
                          placeholder="Correo electrónico"
                          onChange={gestionarCambio}
                          value={form.correo}
                        />
                        {errores.correo && (
                          <p className="errores">{errores.correo}</p>
                        )}
                      </div>
                    </div>

                    <div className="form-section">
                      <h3>Información del Vehículo</h3>

                      {/* Campo Marca con sugerencias */}
                      <div className="form-group autocomplete-container">
                        <input
                          name="marca"
                          type="text"
                          id="marca"
                          list="listaMarcas"
                          placeholder="Escriba la marca del vehículo"
                          onChange={gestionarCambio}
                          onFocus={() => manejarFocus("marca")}
                          onBlur={() => manejarBlur("marca")}
                          value={form.marca}
                          autoComplete="off"
                        />
                        <datalist id="listaMarcas">
                          {marcas.map((marca) => (
                            <option key={marca.id} value={marca.nombre} />
                          ))}
                        </datalist>
                        {mostrarSugerencias.marca && (
                          <div className="sugerencias-autocomplete">
                            {obtenerSugerencias("marca", form.marca).length >
                            0 ? (
                              obtenerSugerencias("marca", form.marca).map(
                                (marca) => (
                                  <div
                                    key={marca.id}
                                    className="sugerencia-item"
                                    onClick={() =>
                                      seleccionarSugerencia(
                                        "marca",
                                        marca.nombre
                                      )
                                    }
                                  >
                                    {marca.nombre}
                                  </div>
                                )
                              )
                            ) : (
                              <div className="sugerencia-item sugerencia-personalizada">
                                ✓ Puede escribir cualquier marca
                              </div>
                            )}
                          </div>
                        )}
                        {errores.marca && (
                          <p className="errores">{errores.marca}</p>
                        )}
                      </div>

                      {/* Campo Modelo con sugerencias */}
                      <div className="form-group autocomplete-container">
                        <input
                          name="modelo"
                          type="text"
                          id="modelo"
                          list="listaModelo"
                          placeholder="Escriba el modelo del vehículo"
                          onChange={gestionarCambio}
                          onFocus={() => manejarFocus("modelo")}
                          onBlur={() => manejarBlur("modelo")}
                          value={form.modelo}
                          autoComplete="off"
                        />
                        <datalist id="listaModelo">
                          {modelosFiltrados.map((modelo) => (
                            <option key={modelo.id} value={modelo.model} />
                          ))}
                        </datalist>
                        {mostrarSugerencias.modelo && (
                          <div className="sugerencias-autocomplete">
                            {obtenerSugerencias("modelo", form.modelo).length >
                            0 ? (
                              obtenerSugerencias("modelo", form.modelo).map(
                                (modelo) => (
                                  <div
                                    key={modelo.id}
                                    className="sugerencia-item"
                                    onClick={() =>
                                      seleccionarSugerencia(
                                        "modelo",
                                        modelo.model
                                      )
                                    }
                                  >
                                    {modelo.model}
                                  </div>
                                )
                              )
                            ) : (
                              <div className="sugerencia-item sugerencia-personalizada">
                                ✓ Puede escribir cualquier modelo
                              </div>
                            )}
                          </div>
                        )}
                        {errores.modelo && (
                          <p className="errores">{errores.modelo}</p>
                        )}
                      </div>

                      {/* Campo Año con sugerencias */}
                      <div className="form-group autocomplete-container">
                        <input
                          name="anio"
                          type="text"
                          id="anio"
                          list="listaAnios"
                          placeholder="Escriba el año del vehículo"
                          onChange={gestionarCambio}
                          onFocus={() => manejarFocus("anio")}
                          onBlur={() => manejarBlur("anio")}
                          value={form.anio}
                          autoComplete="off"
                        />
                        <datalist id="listaAnios">
                          {aniosFiltrados.map((a) => (
                            <option key={a.id} value={a.year} />
                          ))}
                        </datalist>
                        {mostrarSugerencias.anio && (
                          <div className="sugerencias-autocomplete">
                            {obtenerSugerencias("anio", form.anio).length >
                            0 ? (
                              obtenerSugerencias("anio", form.anio).map(
                                (anio) => (
                                  <div
                                    key={anio.id}
                                    className="sugerencia-item"
                                    onClick={() =>
                                      seleccionarSugerencia("anio", anio.year)
                                    }
                                  >
                                    {anio.year}
                                  </div>
                                )
                              )
                            ) : (
                              <div className="sugerencia-item sugerencia-personalizada">
                                ✓ Puede escribir cualquier año
                              </div>
                            )}
                          </div>
                        )}
                        {errores.anio && (
                          <p className="errores">{errores.anio}</p>
                        )}
                      </div>

                      <div className="form-group">
                        <input
                          name="matricula"
                          type="text"
                          id="matricula"
                          placeholder="Matrícula del vehículo"
                          onChange={gestionarCambio}
                          value={form.matricula}
                        />
                        {errores.matricula && (
                          <p className="errores">{errores.matricula}</p>
                        )}
                      </div>
                    </div>

                    <div className="form-section">
                      <h3>Detalles de la Cita</h3>
                      <div className="form-row">
                        <div className="form-group half-width">
                          <label htmlFor="fecha">Fecha</label>
                          <input
                            name="fecha"
                            type="date"
                            id="fecha"
                            min={new Date().toISOString().split("T")[0]}
                            onChange={gestionarCambio}
                            value={form.fecha}
                            className={
                              esFinDeSemana(form.fecha) || esFestivo(form.fecha)
                                ? "error-weekend"
                                : ""
                            }
                          />
                          {errores.fecha && (
                            <p className="errores weekend-error">
                              {errores.fecha}
                            </p>
                          )}
                          {form.fecha && (
                            <p
                              className={`date-info ${
                                esFinDeSemana(form.fecha) ||
                                esFestivo(form.fecha)
                                  ? "date-error"
                                  : "date-success"
                              }`}
                            >
                              {obtenerTipoDia(form.fecha)}
                            </p>
                          )}
                        </div>
                        <div className="form-group half-width">
                          <label htmlFor="hora">Hora</label>
                          <select
                            name="hora"
                            id="hora"
                            onChange={gestionarCambio}
                            value={form.hora}
                            disabled={
                              !form.fecha ||
                              esFinDeSemana(form.fecha) ||
                              esFestivo(form.fecha) ||
                              consultandoHoras
                            }
                          >
                            <option value="">
                              {consultandoHoras
                                ? "Consultando horas..."
                                : esFinDeSemana(form.fecha) ||
                                  esFestivo(form.fecha)
                                ? "Día no laborable"
                                : "Seleccione una hora"}
                            </option>
                            {horasDisponibles.map((hora) => (
                              <option key={hora} value={hora}>
                                {hora}
                              </option>
                            ))}
                          </select>
                          {consultandoHoras && (
                            <p className="loading-info">
                              Consultando disponibilidad...
                            </p>
                          )}
                          {form.fecha &&
                            !esFinDeSemana(form.fecha) &&
                            !esFestivo(form.fecha) &&
                            horasDisponibles.length === 0 &&
                            !consultandoHoras && (
                              <p className="no-availability">
                                No hay horas disponibles para esta fecha
                              </p>
                            )}
                          {errores.hora && (
                            <p className="errores">{errores.hora}</p>
                          )}
                        </div>
                      </div>
                      <div className="form-group">
                        <textarea
                          id="descripcion"
                          name="descripcion"
                          rows="5"
                          placeholder="Describa el problema o servicio requerido..."
                          onChange={gestionarCambio}
                          value={form.descripcion}
                        ></textarea>
                        {errores.descripcion && (
                          <p className="errores">{errores.descripcion}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="form-footer">
                    <button
                      type="submit"
                      disabled={
                        !formularioValido ||
                        procesandoPago ||
                        esFinDeSemana(form.fecha) ||
                        esFestivo(form.fecha)
                      }
                      className={
                        !formularioValido ||
                        esFinDeSemana(form.fecha) ||
                        esFestivo(form.fecha)
                          ? "btn-disabled"
                          : ""
                      }
                    >
                      {procesandoPago ? (
                        "Procesando..."
                      ) : (
                        <>
                          <span>CONTINUAR AL PAGO - 10.00€</span>
                          <i className="icon-arrow"></i>
                        </>
                      )}
                    </button>
                    {(esFinDeSemana(form.fecha) || esFestivo(form.fecha)) && (
                      <p className="weekend-warning">
                        ⚠️{" "}
                        {esFestivo(form.fecha)
                          ? `Día festivo: ${obtenerNombreFestivo(form.fecha)}`
                          : "No se pueden agendar citas los fines de semana"}
                      </p>
                    )}
                    <p className="form-assurance">
                      <i className="icon-check"></i> Depósito reembolsable - Se
                      aplica al precio final
                    </p>
                  </div>
                </>
              )}
            </form>
          )}
        </div>

        <div className="form-image">
          <div className="image-overlay">
            <h2>Expertos en Mecánica Automotriz</h2>
            <p>
              Utilizamos tecnología de última generación para diagnosticar y
              reparar su vehículo
            </p>
            <div className="features-list">
              <div className="feature-item">
                <i className="icon-tool"></i>
                <span>Herramientas profesionales</span>
              </div>
              <div className="feature-item">
                <i className="icon-certificate"></i>
                <span>Técnicos certificados</span>
              </div>
              <div className="feature-item">
                <i className="icon-warranty"></i>
                <span>Garantía en todas las reparaciones</span>
              </div>
              <div className="feature-item">
                <i className="icon-payment"></i>
                <span>Pago seguro con PayPal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormularioCita;
