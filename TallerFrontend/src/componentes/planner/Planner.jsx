import { useState, useEffect } from "react";
import "../../styles/Planner.css";
import {
  UsuarioService,
  TrabajadorService,
  CitaService,
  EntradaTallerService,
  CatalogoService,
  PlannerLogService,
} from "../../axios/index.js";
import PDFService from "../../pdfs/PDFService";
import Swal from "sweetalert2";

function Planner() {
  const [citas, setCitas] = useState([]);
  const [entradasTaller, setEntradasTaller] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [esAdmin, setEsAdmin] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState(null);

  const [marcas, setMarcas] = useState([]);
  const [modelosTodos, setModelosTodos] = useState([]);
  const [modelosFiltrados, setModelosFiltrados] = useState([]);
  const [aniosTodos, setAniosTodos] = useState([]);
  const [aniosFiltrados, setAniosFiltrados] = useState([]);

  const [nuevaEntrada, setNuevaEntrada] = useState({
    marca: "",
    modelo: "",
    matricula: "",
    anio: "",
    nombreCliente: "",
    telefono: "",
    correo: "",
    descripcion: "",
    estado: "pendiente",
  });

  const [itemsPendientes, setItemsPendientes] = useState([]);
  const [itemsEnProceso, setItemsEnProceso] = useState([]);
  const [itemsFinalizados, setItemsFinalizados] = useState([]);

  // Estados para controlar qué columnas están expandidas
  const [columnasExpandidas, setColumnasExpandidas] = useState({
    pendiente: false,
    en_proceso: false,
    finalizado: false,
  });

  // Estados para presupuestos
  const [modalPresupuestoAbierto, setModalPresupuestoAbierto] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const [presupuestoAceptado, setPresupuestoAceptado] = useState({});

  // Estados para el formulario de presupuesto
  const [datosPresupuesto, setDatosPresupuesto] = useState({
    descripcionTrabajo: "",
    trabajos: [
      { descripcion: "Mano de obra general", horas: 1, precioHora: 45 },
    ],
    repuestos: [
      { descripcion: "Filtro de aceite", cantidad: 1, precioUnitario: 15 },
    ],
  });

  useEffect(() => {
    verificarUsuario();
    cargarMarcasModelosAnios();
    cargarDatos();
  }, []);

  const verificarUsuario = () => {
    try {
      console.log("🔄 Verificando usuario en storage...");
      let usuarioStorage = localStorage.getItem("usuario");

      if (!usuarioStorage) {
        usuarioStorage = sessionStorage.getItem("usuario");
        console.log("Usuario obtenido de sessionStorage");
      } else {
        console.log("Usuario obtenido de localStorage - Key: 'usuario'");
      }

      console.log("Datos de usuario en storage:", usuarioStorage);

      if (usuarioStorage) {
        const usuario = JSON.parse(usuarioStorage);
        console.log("Usuario parseado:", usuario);
        if (
          usuario &&
          usuario.id &&
          usuario.id !== "null" &&
          usuario.id !== "undefined"
        ) {
          setUsuarioActual(usuario);
          setEsAdmin(usuario.admin === true || usuario.esAdmin === true);
          console.log(
            "Usuario válido establecido - ID:",
            usuario.id,
            "Correo:",
            usuario.correo,
            "Mecánico:",
            usuario.mecanico
          );
        } else {
          console.log("Usuario sin ID válido:", usuario);
          setUsuarioActual(null);
          setEsAdmin(false);
        }
      } else {
        console.log("No se encontró usuario en storage con key 'usuario'");
        setUsuarioActual(null);
        setEsAdmin(false);
      }
    } catch (error) {
      console.error("Error al verificar usuario:", error);
      setUsuarioActual(null);
      setEsAdmin(false);
    }
  };

  const cargarMarcasModelosAnios = () => {
    CatalogoService.obtenerMarcas()
      .then((response) => {
        setMarcas(response.data);
      })
      .catch((error) => {
        console.error("Error al cargar marcas:", error);
      });

    CatalogoService.obtenerModelos()
      .then((response) => {
        setModelosTodos(response.data);
      })
      .catch((error) => {
        console.error("Error al cargar modelos:", error);
      });

    CatalogoService.obtenerAnios()
      .then((response) => {
        if (response.data && Array.isArray(response.data)) {
          setAniosTodos(response.data);
        }
      })
      .catch((error) => {
        console.error("Error al cargar años:", error);
      });
  };

  const gestionarCambio = (e) => {
    const { name, value } = e.target;
    setNuevaEntrada((prev) => ({ ...prev, [name]: value }));

    if (name === "marca") {
      const marcaSeleccionada = marcas.find((m) => m.nombre === value);

      if (marcaSeleccionada) {
        const modelosFiltrados = modelosTodos.filter(
          (modelo) => modelo.idMarca === marcaSeleccionada.id
        );
        setModelosFiltrados(modelosFiltrados);
      } else {
        setModelosFiltrados([]);
      }

      setNuevaEntrada((prev) => ({ ...prev, modelo: "", anio: "" }));
      setAniosFiltrados([]);
    }

    if (name === "modelo") {
      const modeloSeleccionado = modelosFiltrados.find(
        (m) => m.model === value
      );

      if (modeloSeleccionado) {
        const aniosFiltrados = aniosTodos.filter(
          (a) => a.idModel === modeloSeleccionado.id
        );
        setAniosFiltrados(aniosFiltrados);
      } else {
        setAniosFiltrados([]);
      }

      setNuevaEntrada((prev) => ({ ...prev, anio: "" }));
    }
  };

  const cargarDatos = () => {
    setCargando(true);

    Promise.all([
      CitaService.obtenerCitas(),
      EntradaTallerService.obtenerEntradasTaller(),
    ])
      .then(([citasResponse, entradasResponse]) => {
        const todasCitas = citasResponse.data || [];
        const todasEntradas = entradasResponse.data || [];

        console.log("📅 Citas recibidas:", todasCitas);
        console.log("🚗 Entradas recibidas:", todasEntradas);

        setCitas(todasCitas);
        setEntradasTaller(todasEntradas);

        // Función auxiliar para normalizar propiedades
        const normalizarPropiedades = (item, tipo) => {
          if (tipo === "cita") {
            return {
              id: `cita-${item.id || item.Id}`,
              tipo: "cita",
              origen: "cita",
              Id: item.id || item.Id,
              Nombre: item.nombre || item.Nombre || "Sin nombre",
              Telefono: item.telefono || item.Telefono,
              Correo: item.correo || item.Correo,
              Marca: item.marca || item.Marca,
              Modelo: item.modelo || item.Modelo,
              Matricula: item.matricula || item.Matricula,
              Anio: item.anio || item.Anio,
              Descripcion: item.descripcion || item.Descripcion,
              Estado: item.estado || item.Estado || "pendiente",
              Revisado: item.revisado || item.Revisado || false,
              Fecha: item.fecha || item.Fecha,
              Hora: item.hora || item.Hora,
              FechaIngreso: item.fechaIngreso || item.FechaIngreso,
              FechaFinalizacion:
                item.fechaFinalizacion || item.FechaFinalizacion,
              FechaCreacion: item.fechaCreacion || item.FechaCreacion,
              FechaActualizacion:
                item.fechaActualizacion || item.FechaActualizacion,
            };
          }

          if (tipo === "entrada") {
            return {
              id: `entrada-${item.id || item.Id}`,
              tipo: "entrada",
              origen: "entrada",
              Id: item.id || item.Id,
              Nombre: item.nombreCliente || item.NombreCliente || "Sin nombre",
              Telefono: item.telefono || item.Telefono,
              Correo: item.correo || item.Correo,
              Marca: item.marca || item.Marca,
              Modelo: item.modelo || item.Modelo,
              Matricula: item.matricula || item.Matricula,
              Anio: item.anio || item.Anio,
              Descripcion: item.descripcion || item.Descripcion,
              Estado: item.estado || item.Estado || "pendiente",
              Revisado: item.revisado || item.Revisado || false,
              FechaIngreso: item.fechaIngreso || item.FechaIngreso,
              FechaFinalizacion:
                item.fechaFinalizacion || item.FechaFinalizacion,
              FechaCreacion: item.fechaCreacion || item.FechaCreacion,
              FechaActualizacion:
                item.fechaActualizacion || item.FechaActualizacion,
              Fecha: null,
              Hora: null,
            };
          }

          return item;
        };

        const todosItems = [
          ...todasCitas.map((cita) => normalizarPropiedades(cita, "cita")),
          ...todasEntradas.map((entrada) =>
            normalizarPropiedades(entrada, "entrada")
          ),
        ];

        console.log("🔄 Todos los items normalizados:", todosItems);

        setItemsPendientes(
          todosItems.filter((item) => item.Estado === "pendiente")
        );
        setItemsEnProceso(
          todosItems.filter((item) => item.Estado === "en_proceso")
        );
        setItemsFinalizados(
          todosItems.filter((item) => item.Estado === "finalizado")
        );

        console.log(
          "Items pendientes:",
          todosItems.filter((item) => item.Estado === "pendiente").length
        );
        console.log(
          "Items en proceso:",
          todosItems.filter((item) => item.Estado === "en_proceso").length
        );
        console.log(
          "Items finalizados:",
          todosItems.filter((item) => item.Estado === "finalizado").length
        );
      })
      .catch((error) => {
        console.error("Error al cargar datos:", error);
        Swal.fire("Error", "No se pudieron cargar los datos", "error");
      })
      .finally(() => {
        setCargando(false);
      });
  };

  const guardarLog = async (logData) => {
    try {
      console.log("Verificando usuario actual:", usuarioActual);

      let usuarioId = null;
      if (
        usuarioActual &&
        usuarioActual.id &&
        typeof usuarioActual.id === "string" &&
        usuarioActual.id.trim() !== "" &&
        usuarioActual.id !== "null" &&
        usuarioActual.id !== "undefined"
      ) {
        usuarioId = usuarioActual.id;
        console.log("Usuario ID válido encontrado:", usuarioId);
      } else {
        console.log(
          "No hay usuario válido en sesión, usuarioActual:",
          usuarioActual
        );
      }

      if (!usuarioId) {
        console.log("Guardando log como 'Sistema'");
        await PlannerLogService.guardarLogPlanner({
          ...logData,
          usuario: "Sistema",
        });
        return;
      }

      console.log("🔍 Obteniendo nombre para usuario ID:", usuarioId);

      // Obtener información completa del usuario para el log
      const nombreUsuario = await PlannerLogService.obtenerNombreParaLog(
        usuarioId
      );
      console.log("Nombre obtenido para log:", nombreUsuario);

      // Crear logData con el nombre
      const logConNombre = {
        ...logData,
        usuario: nombreUsuario,
      };

      console.log("Guardando log con usuario:", nombreUsuario);
      await PlannerLogService.guardarLogPlanner(logConNombre);
    } catch (error) {
      console.error("Error al guardar log:", error);
      // Intentar guardar sin nombre como fallback
      try {
        await PlannerLogService.guardarLogPlanner({
          ...logData,
          usuario: "Sistema",
        });
      } catch (fallbackError) {
        console.error(
          "Error incluso al guardar log de fallback:",
          fallbackError
        );
      }
    }
  };

  const actualizarEstadoItem = async (itemId, nuevoEstado, tipo) => {
    console.log(`🔄 Actualizando ${tipo} ${itemId} a estado: ${nuevoEstado}`);

    try {
      // Encontrar el item para logging
      const item = [
        ...itemsPendientes,
        ...itemsEnProceso,
        ...itemsFinalizados,
      ].find((item) => item.id === itemId);

      if (item) {
        const estadoAnterior = item.Estado;

        // Loggear el movimiento
        await guardarLog({
          accion: "MOVIMIENTO_ITEM",
          detalles: `Movió ${item.origen} de ${estadoAnterior} a ${nuevoEstado}`,
          tipoItem: item.origen,
          itemId: item.Id,
          estadoAnterior: estadoAnterior,
          estadoNuevo: nuevoEstado,
          vehiculoInfo: `${item.Marca} ${item.Modelo} - ${item.Matricula}`,
          clienteInfo: item.Nombre,
        });
      }

      if (tipo === "cita") {
        // Actualizar cita
        const id = parseInt(itemId.replace("cita-", ""));
        await CitaService.actualizarEstadoCita(id, {
          Estado: nuevoEstado,
        });
      } else if (tipo === "entrada") {
        // Actualizar entrada del taller
        const id = parseInt(itemId.replace("entrada-", ""));
        await EntradaTallerService.actualizarEstadoEntrada(id, nuevoEstado);
      }

      // Recargar datos para ver cambios en tiempo real
      cargarDatos();
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      Swal.fire("Error", "No se pudo actualizar el estado", "error");
    }
  };

  const marcarComoRevisado = async (itemId, tipo) => {
    console.log(`Marcando como revisado: ${tipo} ${itemId}`);

    try {
      const item = itemsFinalizados.find((item) => item.id === itemId);

      if (item) {
        await guardarLog({
          accion: "MARCADO_REVISADO",
          detalles: `Marcó como revisado el ${item.origen}`,
          tipoItem: item.origen,
          itemId: item.Id,
          vehiculoInfo: `${item.Marca} ${item.Modelo} - ${item.Matricula}`,
          clienteInfo: item.Nombre,
        });
      }

      if (tipo === "cita") {
        const id = parseInt(itemId.replace("cita-", ""));
        await CitaService.marcarCitaComoRevisada(id, { Revisado: true });
      } else if (tipo === "entrada") {
        const id = parseInt(itemId.replace("entrada-", ""));
        await EntradaTallerService.marcarEntradaRevisada(id, true);
      }

      cargarDatos();
    } catch (error) {
      console.error("Error al marcar como revisado:", error);
      Swal.fire("Error", "No se pudo marcar como revisado", "error");
    }
  };

  const agregarEntradaTaller = () => {
    if (
      !nuevaEntrada.marca ||
      !nuevaEntrada.modelo ||
      !nuevaEntrada.matricula ||
      !nuevaEntrada.nombreCliente ||
      !nuevaEntrada.telefono
    ) {
      Swal.fire(
        "Error",
        "Marca, modelo, matrícula, nombre y teléfono son obligatorios",
        "warning"
      );
      return;
    }

    const entradaParaEnviar = {
      Marca: nuevaEntrada.marca,
      Modelo: nuevaEntrada.modelo,
      Matricula: nuevaEntrada.matricula,
      Anio: nuevaEntrada.anio ? parseInt(nuevaEntrada.anio) : null,
      NombreCliente: nuevaEntrada.nombreCliente,
      Telefono: nuevaEntrada.telefono,
      Correo: nuevaEntrada.correo || null,
      Descripcion: nuevaEntrada.descripcion || null,
      Estado: "pendiente",
    };

    EntradaTallerService.añadirEntradaTaller(entradaParaEnviar)
      .then(() => {
        guardarLog({
          accion: "NUEVA_ENTRADA",
          detalles: "Creó nueva entrada directa en el taller",
          tipoItem: "entrada",
          vehiculoInfo: `${nuevaEntrada.marca} ${nuevaEntrada.modelo} - ${nuevaEntrada.matricula}`,
          clienteInfo: nuevaEntrada.nombreCliente,
        });

        setNuevaEntrada({
          marca: "",
          modelo: "",
          matricula: "",
          anio: "",
          nombreCliente: "",
          telefono: "",
          correo: "",
          descripcion: "",
          estado: "pendiente",
        });

        // Limpiar filtros
        setModelosFiltrados([]);
        setAniosFiltrados([]);

        setModalAbierto(false);
        Swal.fire("Éxito", "Entrada añadida correctamente", "success");
        cargarDatos();
      })
      .catch((error) => {
        console.error("Error al añadir entrada:", error);
        Swal.fire("Error", "No se pudo añadir la entrada", "error");
      });
  };

  // Función para calcular subtotal con descuento para citas
  const calcularSubtotal = (item) => {
    const totalTrabajos = datosPresupuesto.trabajos.reduce(
      (sum, trabajo) => sum + trabajo.horas * trabajo.precioHora,
      0
    );

    const totalRepuestos = datosPresupuesto.repuestos.reduce(
      (sum, repuesto) => sum + repuesto.cantidad * repuesto.precioUnitario,
      0
    );

    let subtotal = totalTrabajos + totalRepuestos;

    // Aplicar descuento de 10€ si es una cita
    if (item && item.origen === "cita") {
      subtotal = Math.max(0, subtotal - 10); // Restar 10€, mínimo 0
    }

    return subtotal;
  };

  // Funciones para generar PDFs
  const generarJustificanteEntrada = async (item) => {
    try {
      const doc = await PDFService.generarJustificanteEntrada(item);
      PDFService.descargarPDF(
        doc,
        `justificante_entrada_${item.Matricula || item.Id}.pdf`
      );

      await guardarLog({
        accion: "GENERAR_PDF_ENTRADA",
        detalles: `Generó justificante de entrada para ${item.Marca} ${item.Modelo}`,
        tipoItem: item.origen,
        itemId: item.Id,
        vehiculoInfo: `${item.Marca} ${item.Modelo} - ${item.Matricula}`,
        clienteInfo: item.Nombre,
      });

      Swal.fire("Éxito", "Justificante generado correctamente", "success");
    } catch (error) {
      console.error("Error al generar PDF:", error);
      Swal.fire("Error", "No se pudo generar el justificante", "error");
    }
  };

  const generarInformeFinalizacion = async (item) => {
    try {
      const doc = await PDFService.generarInformeFinalizacion(item);
      PDFService.descargarPDF(
        doc,
        `informe_finalizacion_${item.Matricula || item.Id}.pdf`
      );

      await guardarLog({
        accion: "GENERAR_PDF_FINALIZACION",
        detalles: `Generó informe de finalización para ${item.Marca} ${item.Modelo}`,
        tipoItem: item.origen,
        itemId: item.Id,
        vehiculoInfo: `${item.Marca} ${item.Modelo} - ${item.Matricula}`,
        clienteInfo: item.Nombre,
      });

      Swal.fire(
        "Éxito",
        "Informe de finalización generado correctamente",
        "success"
      );
    } catch (error) {
      console.error("Error al generar PDF:", error);
      Swal.fire("Error", "No se pudo generar el informe", "error");
    }
  };

  const generarJustificanteSeguro = async (item) => {
    try {
      const doc = await PDFService.generarJustificanteSeguro(item);
      PDFService.descargarPDF(
        doc,
        `justificante_seguro_${item.Matricula || item.Id}.pdf`
      );

      await guardarLog({
        accion: "GENERAR_PDF_SEGURO",
        detalles: `Generó justificante para seguro de ${item.Marca} ${item.Modelo}`,
        tipoItem: item.origen,
        itemId: item.Id,
        vehiculoInfo: `${item.Marca} ${item.Modelo} - ${item.Matricula}`,
        clienteInfo: item.Nombre,
      });

      Swal.fire(
        "Éxito",
        "Justificante para seguro generado correctamente",
        "success"
      );
    } catch (error) {
      console.error("Error al generar PDF:", error);
      Swal.fire("Error", "No se pudo generar el justificante", "error");
    }
  };

  // Función para manejar todos los tipos de PDF
  const manejarGeneracionPDF = (tipo, item) => {
    switch (tipo) {
      case "entrada":
        generarJustificanteEntrada(item);
        break;
      case "finalizacion":
        generarInformeFinalizacion(item);
        break;
      case "seguro":
        generarJustificanteSeguro(item);
        break;
      default:
        console.warn("Tipo de PDF no reconocido:", tipo);
    }
  };

  // Funciones para presupuestos
  const abrirModalPresupuesto = (item) => {
    setItemSeleccionado(item);
    setModalPresupuestoAbierto(true);

    // Pre-llenar descripción si existe
    if (item.Descripcion) {
      setDatosPresupuesto((prev) => ({
        ...prev,
        descripcionTrabajo: item.Descripcion,
      }));
    }
  };

  const manejarCambioPresupuesto = (e, tipo, index, campo) => {
    const { value } = e.target;

    setDatosPresupuesto((prev) => {
      const nuevo = { ...prev };

      if (tipo === "trabajo") {
        nuevo.trabajos[index][campo] =
          campo === "descripcion" ? value : Number(value);
      } else if (tipo === "repuesto") {
        nuevo.repuestos[index][campo] =
          campo === "descripcion" ? value : Number(value);
      } else {
        nuevo[campo] = value;
      }

      return nuevo;
    });
  };

  const agregarTrabajo = () => {
    setDatosPresupuesto((prev) => ({
      ...prev,
      trabajos: [
        ...prev.trabajos,
        { descripcion: "", horas: 1, precioHora: 45 },
      ],
    }));
  };

  const agregarRepuesto = () => {
    setDatosPresupuesto((prev) => ({
      ...prev,
      repuestos: [
        ...prev.repuestos,
        { descripcion: "", cantidad: 1, precioUnitario: 0 },
      ],
    }));
  };

  const eliminarTrabajo = (index) => {
    setDatosPresupuesto((prev) => ({
      ...prev,
      trabajos: prev.trabajos.filter((_, i) => i !== index),
    }));
  };

  const eliminarRepuesto = (index) => {
    setDatosPresupuesto((prev) => ({
      ...prev,
      repuestos: prev.repuestos.filter((_, i) => i !== index),
    }));
  };

  const generarPresupuestoPDF = async () => {
    try {
      const subtotal = calcularSubtotal(itemSeleccionado);
      const datosCompletos = {
        ...datosPresupuesto,
        subtotal: subtotal,
      };

      const doc = await PDFService.generarPresupuesto(
        itemSeleccionado,
        datosCompletos
      );
      PDFService.descargarPDF(
        doc,
        `presupuesto_${itemSeleccionado.Matricula || itemSeleccionado.Id}.pdf`
      );

      await guardarLog({
        accion: "GENERAR_PRESUPUESTO",
        detalles: `Generó presupuesto para ${itemSeleccionado.Marca} ${itemSeleccionado.Modelo}`,
        tipoItem: itemSeleccionado.origen,
        itemId: itemSeleccionado.Id,
        vehiculoInfo: `${itemSeleccionado.Marca} ${itemSeleccionado.Modelo} - ${itemSeleccionado.Matricula}`,
        clienteInfo: itemSeleccionado.Nombre,
      });

      Swal.fire("Éxito", "Presupuesto generado correctamente", "success");
    } catch (error) {
      console.error("Error al generar presupuesto:", error);
      Swal.fire("Error", "No se pudo generar el presupuesto", "error");
    }
  };

  const aceptarPresupuesto = async () => {
    try {
      const subtotal = calcularSubtotal(itemSeleccionado);
      const datosCompletos = {
        ...datosPresupuesto,
        subtotal: subtotal,
      };

      // Generar número de factura único
      const numeroFactura = `F-${itemSeleccionado.Id}-${Date.now()
        .toString()
        .slice(-4)}`;

      // Generar factura
      const docFactura = await PDFService.generarFactura(
        itemSeleccionado,
        datosCompletos,
        numeroFactura
      );
      PDFService.descargarPDF(
        docFactura,
        `factura_${itemSeleccionado.Matricula || itemSeleccionado.Id}.pdf`
      );

      // Guardar estado de presupuesto aceptado
      setPresupuestoAceptado((prev) => ({
        ...prev,
        [itemSeleccionado.id]: true,
      }));

      await guardarLog({
        accion: "PRESUPUESTO_ACEPTADO",
        detalles: `Aceptó presupuesto y generó factura para ${itemSeleccionado.Marca} ${itemSeleccionado.Modelo}`,
        tipoItem: itemSeleccionado.origen,
        itemId: itemSeleccionado.Id,
        vehiculoInfo: `${itemSeleccionado.Marca} ${itemSeleccionado.Modelo} - ${itemSeleccionado.Matricula}`,
        clienteInfo: itemSeleccionado.Nombre,
        numeroFactura: numeroFactura,
        total: subtotal * 1.21,
      });

      setModalPresupuestoAbierto(false);
      Swal.fire("Éxito", "Presupuesto aceptado y factura generada", "success");
    } catch (error) {
      console.error("Error al aceptar presupuesto:", error);
      Swal.fire("Error", "No se pudo generar la factura", "error");
    }
  };

  const handleDragStart = (e, itemId, itemTipo) => {
    e.dataTransfer.setData("itemId", itemId);
    e.dataTransfer.setData("itemTipo", itemTipo);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, estadoDestino) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("itemId");
    const itemTipo = e.dataTransfer.getData("itemTipo");
    await actualizarEstadoItem(itemId, estadoDestino, itemTipo);
  };

  const formatFechaHora = (fecha, hora) => {
    if (!fecha) return "Sin fecha";

    try {
      const fechaObj = new Date(fecha);
      const opciones = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      };

      let fechaFormateada = fechaObj.toLocaleDateString("es-ES", opciones);

      if (hora) {
        if (typeof hora === "string" && hora.includes(":")) {
          const partesHora = hora.split(":");
          fechaFormateada += ` - ${partesHora[0]}:${partesHora[1]}`;
        } else {
          fechaFormateada += ` - ${hora}`;
        }
      }

      return fechaFormateada;
    } catch (error) {
      console.error("Error al formatear fecha:", error, fecha, hora);
      return "Fecha inválida";
    }
  };

  // Función para alternar la visibilidad de una columna
  const toggleColumnaExpandida = (columna) => {
    setColumnasExpandidas((prev) => ({
      ...prev,
      [columna]: !prev[columna],
    }));
  };

  // Función para obtener los items a mostrar (limitados o todos)
  const obtenerItemsAMostrar = (items, columna) => {
    if (columnasExpandidas[columna]) {
      return items;
    }
    return items.slice(0, 5);
  };

  if (cargando) {
    return (
      <div className="planner-cargando">
        <div className="planner-spinner"></div>
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="planner-container">
      <div className="planner-header">
        <h1>Planner de Taller</h1>
        <p>
          Gestiona el estado de citas y vehículos arrastrando las tarjetas entre
          columnas
        </p>
        {/* Enlace a logs - SOLO para admin */}
        {esAdmin && (
          <div className="planner-admin-links">
            <a href="/planner-log" className="btn-ver-logs">
              Ver Logs de Actividad
            </a>
          </div>
        )}
      </div>

      <div className="planner-columns">
        {/* Columna Pendiente */}
        <div
          className="planner-column"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "pendiente")}
        >
          <div className="planner-column-header pendiente">
            <h2>Pendiente</h2>
            <span className="planner-contador">{itemsPendientes.length}</span>
          </div>
          <div className="planner-column-content">
            {obtenerItemsAMostrar(itemsPendientes, "pendiente").map((item) => (
              <TarjetaItem
                key={item.id}
                item={item}
                onDragStart={handleDragStart}
                formatoFechaHora={formatFechaHora}
                onGenerarPDF={manejarGeneracionPDF}
                onAbrirPresupuesto={abrirModalPresupuesto}
                presupuestoAceptado={presupuestoAceptado[item.id]}
              />
            ))}
            {itemsPendientes.length === 0 && (
              <div className="planner-columna-vacia">
                <p>No hay items pendientes</p>
              </div>
            )}
            {itemsPendientes.length > 5 && (
              <div className="planner-columna-footer">
                <button
                  className="planner-btn-mostrar-todos"
                  onClick={() => toggleColumnaExpandida("pendiente")}
                >
                  {columnasExpandidas.pendiente
                    ? "Mostrar menos"
                    : `Mostrar todos (${itemsPendientes.length})`}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Columna En Proceso */}
        <div
          className="planner-column"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "en_proceso")}
        >
          <div className="planner-column-header en-proceso">
            <h2>En Proceso</h2>
            <span className="planner-contador">{itemsEnProceso.length}</span>
          </div>
          <div className="planner-column-content">
            {obtenerItemsAMostrar(itemsEnProceso, "en_proceso").map((item) => (
              <TarjetaItem
                key={item.id}
                item={item}
                onDragStart={handleDragStart}
                formatoFechaHora={formatFechaHora}
                onGenerarPDF={manejarGeneracionPDF}
                onAbrirPresupuesto={abrirModalPresupuesto}
                presupuestoAceptado={presupuestoAceptado[item.id]}
              />
            ))}
            {itemsEnProceso.length === 0 && (
              <div className="planner-columna-vacia">
                <p>No hay items en proceso</p>
              </div>
            )}
            {itemsEnProceso.length > 5 && (
              <div className="planner-columna-footer">
                <button
                  className="planner-btn-mostrar-todos"
                  onClick={() => toggleColumnaExpandida("en_proceso")}
                >
                  {columnasExpandidas.en_proceso
                    ? "Mostrar menos"
                    : `Mostrar todos (${itemsEnProceso.length})`}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Columna Finalizado */}
        <div
          className="planner-column"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "finalizado")}
        >
          <div className="planner-column-header finalizado">
            <h2>Finalizado</h2>
            <span className="planner-contador">{itemsFinalizados.length}</span>
          </div>
          <div className="planner-column-content">
            {obtenerItemsAMostrar(itemsFinalizados, "finalizado").map(
              (item) => (
                <TarjetaItemFinalizado
                  key={item.id}
                  item={item}
                  onDragStart={handleDragStart}
                  onRevisar={marcarComoRevisado}
                  formatoFechaHora={formatFechaHora}
                  onGenerarPDF={manejarGeneracionPDF}
                  onAbrirPresupuesto={abrirModalPresupuesto}
                  presupuestoAceptado={presupuestoAceptado[item.id]}
                />
              )
            )}
            {itemsFinalizados.length === 0 && (
              <div className="planner-columna-vacia">
                <p>No hay items finalizados</p>
              </div>
            )}
            {itemsFinalizados.length > 5 && (
              <div className="planner-columna-footer">
                <button
                  className="planner-btn-mostrar-todos"
                  onClick={() => toggleColumnaExpandida("finalizado")}
                >
                  {columnasExpandidas.finalizado
                    ? "Mostrar menos"
                    : `Mostrar todos (${itemsFinalizados.length})`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botón flotante para añadir entrada */}
      <button
        className="planner-btn-flotante"
        onClick={() => setModalAbierto(true)}
        title="Añadir nueva entrada al taller"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      </button>

      {/* Modal para añadir entrada */}
      {modalAbierto && (
        <div className="planner-modal-overlay">
          <div className="planner-modal-contenido">
            <div className="planner-modal-header">
              <h2>Añadir Nueva Entrada al Taller</h2>
              <button
                onClick={() => {
                  setModalAbierto(false);
                  setModelosFiltrados([]);
                  setAniosFiltrados([]);
                }}
                className="planner-btn-cerrar-modal"
              >
                &times;
              </button>
            </div>
            <div className="planner-modal-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  agregarEntradaTaller();
                }}
              >
                <div className="planner-form-grid">
                  {/* Marca con datalist */}
                  <div className="planner-form-group">
                    <label>Marca *</label>
                    <input
                      type="text"
                      name="marca"
                      list="listaMarcas"
                      placeholder="Seleccione la marca"
                      onChange={gestionarCambio}
                      value={nuevaEntrada.marca}
                      required
                    />
                    <datalist id="listaMarcas">
                      {marcas.map((marca) => (
                        <option key={marca.id} value={marca.nombre} />
                      ))}
                    </datalist>
                  </div>

                  {/* Modelo con datalist */}
                  <div className="planner-form-group">
                    <label>Modelo *</label>
                    <input
                      type="text"
                      name="modelo"
                      list="listaModelos"
                      placeholder="Seleccione el modelo"
                      onChange={gestionarCambio}
                      value={nuevaEntrada.modelo}
                      disabled={!nuevaEntrada.marca}
                      required
                    />
                    <datalist id="listaModelos">
                      {modelosFiltrados.map((modelo) => (
                        <option key={modelo.id} value={modelo.model} />
                      ))}
                    </datalist>
                  </div>

                  {/* Año con datalist */}
                  <div className="planner-form-group">
                    <label>Año</label>
                    <input
                      type="text"
                      name="anio"
                      list="listaAnios"
                      placeholder="Seleccione el año"
                      onChange={gestionarCambio}
                      value={nuevaEntrada.anio}
                      disabled={!nuevaEntrada.modelo}
                    />
                    <datalist id="listaAnios">
                      {aniosFiltrados.map((a) => (
                        <option key={a.id} value={a.year} />
                      ))}
                    </datalist>
                  </div>

                  {/* Matrícula */}
                  <div className="planner-form-group">
                    <label>Matrícula *</label>
                    <input
                      type="text"
                      name="matricula"
                      placeholder="Matrícula del vehículo"
                      onChange={gestionarCambio}
                      value={nuevaEntrada.matricula}
                      required
                    />
                  </div>

                  {/* Nombre del Cliente */}
                  <div className="planner-form-group planner-form-full-width">
                    <label>Nombre del Cliente *</label>
                    <input
                      type="text"
                      name="nombreCliente"
                      placeholder="Nombre completo del cliente"
                      onChange={gestionarCambio}
                      value={nuevaEntrada.nombreCliente}
                      required
                    />
                  </div>

                  {/* Teléfono */}
                  <div className="planner-form-group">
                    <label>Teléfono *</label>
                    <input
                      type="tel"
                      name="telefono"
                      placeholder="Teléfono de contacto"
                      onChange={gestionarCambio}
                      value={nuevaEntrada.telefono}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="planner-form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="correo"
                      placeholder="Correo electrónico"
                      onChange={gestionarCambio}
                      value={nuevaEntrada.correo}
                    />
                  </div>

                  {/* Descripción */}
                  <div className="planner-form-group planner-form-full-width">
                    <label>Descripción del Trabajo</label>
                    <textarea
                      name="descripcion"
                      placeholder="Describe el trabajo a realizar..."
                      onChange={gestionarCambio}
                      value={nuevaEntrada.descripcion}
                      rows="3"
                    />
                  </div>
                </div>
                <div className="planner-modal-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setModalAbierto(false);
                      setModelosFiltrados([]);
                      setAniosFiltrados([]);
                    }}
                    className="planner-btn-cancelar"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="planner-btn-confirmar">
                    Añadir Entrada
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Presupuesto */}
      {modalPresupuestoAbierto && (
        <div className="planner-modal-overlay">
          <div className="planner-modal-contenido presupuesto-modal">
            <div className="planner-modal-header">
              <h2>Generar Presupuesto</h2>
              <button
                onClick={() => {
                  setModalPresupuestoAbierto(false);
                  setDatosPresupuesto({
                    descripcionTrabajo: "",
                    trabajos: [
                      {
                        descripcion: "Mano de obra general",
                        horas: 1,
                        precioHora: 45,
                      },
                    ],
                    repuestos: [
                      {
                        descripcion: "Filtro de aceite",
                        cantidad: 1,
                        precioUnitario: 15,
                      },
                    ],
                  });
                }}
                className="planner-btn-cerrar-modal"
              >
                &times;
              </button>
            </div>

            <div className="planner-modal-body">
              <div className="presupuesto-info-cliente">
                <h3>Cliente: {itemSeleccionado?.Nombre}</h3>
                <p>
                  Vehículo: {itemSeleccionado?.Marca} {itemSeleccionado?.Modelo}{" "}
                  - {itemSeleccionado?.Matricula}
                </p>
                {itemSeleccionado?.origen === "cita" && (
                  <div className="presupuesto-info-descuento">
                    <small>
                      💡 Se aplicará descuento de 10.00€ por el depósito de
                      reserva pagado
                    </small>
                  </div>
                )}
              </div>

              <div className="presupuesto-form">
                {/* Descripción del trabajo */}
                <div className="presupuesto-form-group">
                  <label>Descripción del Trabajo *</label>
                  <textarea
                    value={datosPresupuesto.descripcionTrabajo}
                    onChange={(e) =>
                      manejarCambioPresupuesto(
                        e,
                        "general",
                        null,
                        "descripcionTrabajo"
                      )
                    }
                    placeholder="Describe detalladamente el trabajo a realizar..."
                    rows="3"
                    required
                  />
                </div>

                {/* Trabajos/Mano de obra */}
                <div className="presupuesto-seccion">
                  <div className="presupuesto-seccion-header">
                    <h4>Mano de Obra</h4>
                    <button
                      type="button"
                      onClick={agregarTrabajo}
                      className="btn-agregar"
                    >
                      + Agregar Trabajo
                    </button>
                  </div>

                  {datosPresupuesto.trabajos.map((trabajo, index) => (
                    <div key={index} className="presupuesto-item">
                      <input
                        type="text"
                        placeholder="Descripción del trabajo"
                        value={trabajo.descripcion}
                        onChange={(e) =>
                          manejarCambioPresupuesto(
                            e,
                            "trabajo",
                            index,
                            "descripcion"
                          )
                        }
                        className="presupuesto-descripcion"
                      />
                      <input
                        type="number"
                        placeholder="Horas"
                        value={trabajo.horas}
                        onChange={(e) =>
                          manejarCambioPresupuesto(e, "trabajo", index, "horas")
                        }
                        min="0.5"
                        step="0.5"
                        className="presupuesto-cantidad"
                      />
                      <input
                        type="number"
                        placeholder="Precio/hora"
                        value={trabajo.precioHora}
                        onChange={(e) =>
                          manejarCambioPresupuesto(
                            e,
                            "trabajo",
                            index,
                            "precioHora"
                          )
                        }
                        min="0"
                        step="5"
                        className="presupuesto-precio"
                      />
                      <span className="presupuesto-subtotal">
                        {PDFService.formatearPrecio(
                          trabajo.horas * trabajo.precioHora
                        )}
                      </span>
                      {datosPresupuesto.trabajos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => eliminarTrabajo(index)}
                          className="btn-eliminar"
                          title="Eliminar trabajo"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Repuestos */}
                <div className="presupuesto-seccion">
                  <div className="presupuesto-seccion-header">
                    <h4>Repuestos y Materiales</h4>
                    <button
                      type="button"
                      onClick={agregarRepuesto}
                      className="btn-agregar"
                    >
                      + Agregar Repuesto
                    </button>
                  </div>

                  {datosPresupuesto.repuestos.map((repuesto, index) => (
                    <div key={index} className="presupuesto-item">
                      <input
                        type="text"
                        placeholder="Descripción del repuesto"
                        value={repuesto.descripcion}
                        onChange={(e) =>
                          manejarCambioPresupuesto(
                            e,
                            "repuesto",
                            index,
                            "descripcion"
                          )
                        }
                        className="presupuesto-descripcion"
                      />
                      <input
                        type="number"
                        placeholder="Cantidad"
                        value={repuesto.cantidad}
                        onChange={(e) =>
                          manejarCambioPresupuesto(
                            e,
                            "repuesto",
                            index,
                            "cantidad"
                          )
                        }
                        min="1"
                        className="presupuesto-cantidad"
                      />
                      <input
                        type="number"
                        placeholder="Precio unitario"
                        value={repuesto.precioUnitario}
                        onChange={(e) =>
                          manejarCambioPresupuesto(
                            e,
                            "repuesto",
                            index,
                            "precioUnitario"
                          )
                        }
                        min="0"
                        step="0.01"
                        className="presupuesto-precio"
                      />
                      <span className="presupuesto-subtotal">
                        {PDFService.formatearPrecio(
                          repuesto.cantidad * repuesto.precioUnitario
                        )}
                      </span>
                      {datosPresupuesto.repuestos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => eliminarRepuesto(index)}
                          className="btn-eliminar"
                          title="Eliminar repuesto"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Resumen del presupuesto */}
                <div className="presupuesto-resumen">
                  <h4>Resumen del Presupuesto</h4>

                  {/* Mostrar descuento si es cita */}
                  {itemSeleccionado?.origen === "cita" && (
                    <div className="presupuesto-descuento">
                      <div className="presupuesto-total-line descuento">
                        <span>Descuento por reserva:</span>
                        <span>- {PDFService.formatearPrecio(10)}</span>
                      </div>
                      <div className="presupuesto-info-descuento">
                        <small>
                          Se ha aplicado el descuento del depósito de reserva
                          pagado
                        </small>
                      </div>
                    </div>
                  )}

                  <div className="presupuesto-totales">
                    <div className="presupuesto-total-line">
                      <span>Subtotal (sin IVA):</span>
                      <span>
                        {PDFService.formatearPrecio(
                          calcularSubtotal(itemSeleccionado)
                        )}
                      </span>
                    </div>
                    <div className="presupuesto-total-line">
                      <span>IVA (21%):</span>
                      <span>
                        {PDFService.formatearPrecio(
                          calcularSubtotal(itemSeleccionado) * 0.21
                        )}
                      </span>
                    </div>
                    <div className="presupuesto-total-line total">
                      <span>TOTAL:</span>
                      <span>
                        {PDFService.formatearPrecio(
                          calcularSubtotal(itemSeleccionado) * 1.21
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="presupuesto-acciones">
                <button
                  type="button"
                  onClick={generarPresupuestoPDF}
                  className="planner-btn-presupuesto"
                >
                  📄 Generar Presupuesto PDF
                </button>
                <button
                  type="button"
                  onClick={aceptarPresupuesto}
                  className="planner-btn-factura"
                >
                  ✅ Aceptar y Generar Factura
                </button>
                <button
                  type="button"
                  onClick={() => setModalPresupuestoAbierto(false)}
                  className="planner-btn-cancelar"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TarjetaItem({
  item,
  onDragStart,
  formatoFechaHora,
  onGenerarPDF,
  onAbrirPresupuesto,
  presupuestoAceptado,
}) {
  const esCita = item.origen === "cita";

  return (
    <div
      className={`planner-tarjeta-cita ${
        !esCita ? "planner-entrada-directa" : ""
      }`}
      draggable
      onDragStart={(e) => onDragStart(e, item.id, item.origen)}
    >
      <div className="planner-cita-header">
        <span className="planner-cita-fecha">
          {esCita
            ? formatoFechaHora(item.Fecha, item.Hora)
            : `Ingreso: ${formatoFechaHora(item.FechaIngreso)}`}
        </span>
        <div className="planner-cita-titulo">
          <h3 className="planner-cita-nombre">{item.Nombre || "Sin nombre"}</h3>
          {!esCita && <span className="planner-badge-entrada">DIRECTA</span>}
          {esCita && <span className="planner-badge-cita">CITA</span>}
        </div>
      </div>

      <div className="planner-cita-vehiculo">
        <p>
          <strong>Vehículo:</strong> {item.Marca} {item.Modelo}
        </p>
        <p>
          <strong>Año:</strong> {item.Anio || "N/A"}
        </p>
        <p>
          <strong>Matrícula:</strong> {item.Matricula}
        </p>
      </div>

      <div className="planner-cita-contacto">
        <p>
          <strong>Teléfono:</strong> {item.Telefono}
        </p>
        {item.Correo && (
          <p>
            <strong>Email:</strong> {item.Correo}
          </p>
        )}
      </div>

      {item.Descripcion && (
        <div className="planner-cita-descripcion">
          <p>
            <strong>Descripción:</strong> {item.Descripcion}
          </p>
        </div>
      )}

      {/* Botones de PDF */}
      <div className="planner-cita-acciones-pdf">
        <button
          className="planner-btn-pdf planner-btn-entrada"
          onClick={() => onGenerarPDF("entrada", item)}
          title="Generar justificante de entrada"
        >
          📄 Entrada
        </button>
        <button
          className="planner-btn-pdf planner-btn-presupuesto"
          onClick={() => onAbrirPresupuesto(item)}
          title="Generar presupuesto"
          disabled={presupuestoAceptado}
        >
          {presupuestoAceptado ? "✅ Aceptado" : "💰 Presupuesto"}
        </button>
        <button
          className="planner-btn-pdf planner-btn-seguro"
          onClick={() => onGenerarPDF("seguro", item)}
          title="Generar justificante para seguro"
        >
          🏢 Seguro
        </button>
      </div>

      <div className="planner-cita-arrastrar">
        <span>↔ Arrastrar para mover</span>
      </div>
    </div>
  );
}

function TarjetaItemFinalizado({
  item,
  onDragStart,
  onRevisar,
  formatoFechaHora,
  onGenerarPDF,
  onAbrirPresupuesto,
  presupuestoAceptado,
}) {
  const esCita = item.origen === "cita";

  return (
    <div
      className={`planner-tarjeta-cita ${
        item.Revisado ? "planner-revisado" : ""
      } ${!esCita ? "planner-entrada-directa" : ""}`}
      draggable
      onDragStart={(e) => onDragStart(e, item.id, item.origen)}
    >
      <div className="planner-cita-header">
        <span className="planner-cita-fecha">
          {esCita
            ? formatoFechaHora(item.Fecha, item.Hora)
            : `Ingreso: ${formatoFechaHora(item.FechaIngreso)}`}
        </span>
        <div className="planner-cita-titulo">
          <h3 className="planner-cita-nombre">{item.Nombre || "Sin nombre"}</h3>
          {!esCita && <span className="planner-badge-entrada">DIRECTA</span>}
          {esCita && <span className="planner-badge-cita">CITA</span>}
        </div>
      </div>

      <div className="planner-cita-vehiculo">
        <p>
          <strong>Vehículo:</strong> {item.Marca} {item.Modelo}
        </p>
        <p>
          <strong>Año:</strong> {item.Anio || "N/A"}
        </p>
        <p>
          <strong>Matrícula:</strong> {item.Matricula}
        </p>
      </div>

      <div className="planner-cita-contacto">
        <p>
          <strong>Teléfono:</strong> {item.Telefono}
        </p>
        {item.Correo && (
          <p>
            <strong>Email:</strong> {item.Correo}
          </p>
        )}
      </div>

      {item.Descripcion && (
        <div className="planner-cita-descripcion">
          <p>
            <strong>Descripción:</strong> {item.Descripcion}
          </p>
        </div>
      )}

      {/* Checkbox de Revisado */}
      <div className="planner-cita-revisado">
        <label className="planner-checkbox-revisado">
          <input
            type="checkbox"
            checked={item.Revisado || false}
            onChange={() => onRevisar(item.id, item.origen)}
          />
          <span className="planner-checkbox-custom">
            {item.Revisado ? "✅" : "⬜"}
          </span>
          <span className="planner-texto-revisado">
            {item.Revisado ? "Revisado" : "Marcar como revisado"}
          </span>
        </label>
      </div>

      {/* Botones de PDF para items finalizados */}
      <div className="planner-cita-acciones-pdf">
        <button
          className="planner-btn-pdf planner-btn-entrada"
          onClick={() => onGenerarPDF("entrada", item)}
          title="Generar justificante de entrada"
        >
          📄 Entrada
        </button>
        <button
          className="planner-btn-pdf planner-btn-presupuesto"
          onClick={() => onAbrirPresupuesto(item)}
          title="Generar presupuesto"
          disabled={presupuestoAceptado}
        >
          {presupuestoAceptado ? "✅ Aceptado" : "💰 Presupuesto"}
        </button>
        <button
          className="planner-btn-pdf planner-btn-finalizacion"
          onClick={() => onGenerarPDF("finalizacion", item)}
          title="Generar informe de finalización"
        >
          ✅ Finalización
        </button>
        <button
          className="planner-btn-pdf planner-btn-seguro"
          onClick={() => onGenerarPDF("seguro", item)}
          title="Generar justificante para seguro"
        >
          🏢 Seguro
        </button>
      </div>

      <div className="planner-cita-arrastrar">
        <span>↔ Arrastrar para mover</span>
      </div>
    </div>
  );
}

export default Planner;
