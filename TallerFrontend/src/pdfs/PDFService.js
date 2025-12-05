import jsPDF from 'jspdf';

class PDFService {
  // Constantes del taller
  static TALLER_INFO = {
    nombre: "Taller Mecánico",
    direccion: "Calle Puerto Rico 5, Chamartín, 28016 Madrid",
    telefono: "+34 671 347 158",
    email: "tgwxmarioox@gmail.com",
    cif: "B12345678"
  };

  /**
   * Genera un justificante de entrada al taller
   */
  static async generarJustificanteEntrada(item) {
    const doc = new jsPDF();
    
    // Configuración del documento
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    
    // Header del taller
    doc.text('JUSTIFICANTE DE ENTRADA', 105, 25, { align: 'center' });
    
    // Información del taller
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(this.TALLER_INFO.nombre, 20, 35);
    doc.text(this.TALLER_INFO.direccion, 20, 40);
    doc.text(`Tel: ${this.TALLER_INFO.telefono}`, 20, 45);
    doc.text(`Email: ${this.TALLER_INFO.email}`, 20, 50);
    
    // Fecha de emisión
    const fecha = new Date().toLocaleDateString('es-ES');
    doc.text(`Fecha: ${fecha}`, 150, 35);
    doc.text(`Nº Referencia: ${item.Id || 'N/A'}`, 150, 40);
    
    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 55, 190, 55);
    
    // Información del cliente
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('INFORMACIÓN DEL CLIENTE', 20, 65);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre: ${item.Nombre || 'No especificado'}`, 20, 75);
    doc.text(`Teléfono: ${item.Telefono || 'No especificado'}`, 20, 82);
    doc.text(`Email: ${item.Correo || 'No especificado'}`, 20, 89);
    
    // Información del vehículo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DEL VEHÍCULO', 20, 105);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Marca: ${item.Marca || 'No especificada'}`, 20, 115);
    doc.text(`Modelo: ${item.Modelo || 'No especificado'}`, 20, 122);
    doc.text(`Matrícula: ${item.Matricula || 'No especificada'}`, 20, 129);
    doc.text(`Año: ${item.Anio || 'No especificado'}`, 20, 136);
    
    // Descripción del trabajo
    if (item.Descripcion) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('DESCRIPCIÓN DEL TRABAJO', 20, 155);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const descripcionLines = doc.splitTextToSize(item.Descripcion, 170);
      doc.text(descripcionLines, 20, 165);
    }
    
    // Estado actual
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ESTADO ACTUAL', 20, item.Descripcion ? 195 : 175);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const estado = this.obtenerTextoEstado(item.Estado);
    doc.text(`Estado: ${estado}`, 20, item.Descripcion ? 205 : 185);
    
    // Firma y sello
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Firma del cliente:', 30, 250);
    doc.text('Sello del taller:', 130, 250);
    
    // Líneas para firmas
    doc.setDrawColor(200, 200, 200);
    doc.line(30, 255, 80, 255);
    doc.line(130, 255, 180, 255);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Este documento sirve como justificante de la entrada del vehículo en el taller.', 105, 270, { align: 'center' });
    doc.text('Conserve este documento para cualquier reclamación.', 105, 275, { align: 'center' });
    
    return doc;
  }

  /**
   * Genera un informe de trabajo completado
   */
  static async generarInformeFinalizacion(item) {
    const doc = new jsPDF();
    
    // Configuración
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    
    // Header
    doc.text('INFORME DE TRABAJO FINALIZADO', 105, 25, { align: 'center' });
    
    // Información del taller
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(this.TALLER_INFO.nombre, 20, 35);
    doc.text(this.TALLER_INFO.direccion, 20, 40);
    doc.text(`Tel: ${this.TALLER_INFO.telefono}`, 20, 45);
    
    // Fechas
    const fechaActual = new Date().toLocaleDateString('es-ES');
    const fechaIngreso = item.FechaIngreso ? new Date(item.FechaIngreso).toLocaleDateString('es-ES') : 'N/A';
    const fechaFinalizacion = item.FechaFinalizacion ? new Date(item.FechaFinalizacion).toLocaleDateString('es-ES') : fechaActual;
    
    doc.text(`Fecha entrada: ${fechaIngreso}`, 150, 35);
    doc.text(`Fecha finalización: ${fechaFinalizacion}`, 150, 40);
    doc.text(`Nº Referencia: ${item.Id || 'N/A'}`, 150, 45);
    
    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 50, 190, 50);
    
    // Información del cliente y vehículo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('DATOS DEL SERVICIO', 20, 60);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Cliente: ${item.Nombre || 'No especificado'}`, 20, 70);
    doc.text(`Vehículo: ${item.Marca || ''} ${item.Modelo || ''}`, 20, 77);
    doc.text(`Matrícula: ${item.Matricula || 'No especificada'}`, 20, 84);
    doc.text(`Año: ${item.Anio || 'No especificado'}`, 20, 91);
    
    // Trabajo realizado
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TRABAJO REALIZADO', 20, 105);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const descripcion = item.Descripcion || 'Servicio de mantenimiento y reparación general.';
    const descripcionLines = doc.splitTextToSize(descripcion, 170);
    doc.text(descripcionLines, 20, 115);
    
    // Observaciones
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('OBSERVACIONES', 20, 150);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const observaciones = 'El vehículo ha sido revisado y reparado según los estándares del taller. Se recomienda mantenimiento periódico.';
    const observacionesLines = doc.splitTextToSize(observaciones, 170);
    doc.text(observacionesLines, 20, 160);
    
    // Firmas
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Firma del mecánico:', 30, 220);
    doc.text('Firma del cliente:', 130, 220);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(30, 225, 80, 225);
    doc.line(130, 225, 180, 225);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Gracias por confiar en nuestros servicios.', 105, 250, { align: 'center' });
    doc.text('Para cualquier consulta, no dude en contactarnos.', 105, 255, { align: 'center' });
    
    return doc;
  }

  /**
   * Genera un justificante para seguros
   */
  static async generarJustificanteSeguro(item) {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    
    doc.text('JUSTIFICANTE PARA SEGURO', 105, 25, { align: 'center' });
    
    // Información del taller
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(this.TALLER_INFO.nombre, 20, 40);
    doc.text(this.TALLER_INFO.direccion, 20, 45);
    doc.text(`Tel: ${this.TALLER_INFO.telefono}`, 20, 50);
    doc.text(`CIF: ${this.TALLER_INFO.cif}`, 20, 55);
    
    const fecha = new Date().toLocaleDateString('es-ES');
    doc.text(`Fecha: ${fecha}`, 150, 40);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 60, 190, 60);
    
    // Certificación
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    
    const certificacion = [
      `Por medio del presente, ${this.TALLER_INFO.nombre} con CIF ${this.TALLER_INFO.cif},`,
      `certifica que el vehículo con las siguientes características se encuentra actualmente`,
      `en nuestras instalaciones para su reparación:`,
      ``,
      `Propietario: ${item.Nombre || 'No especificado'}`,
      `Vehículo: ${item.Marca || ''} ${item.Modelo || ''}`,
      `Matrícula: ${item.Matricula || 'No especificada'}`,
      `Año: ${item.Anio || 'No especificado'}`,
      ``,
      `El vehículo ingresó en nuestras instalaciones el día ${item.FechaIngreso ? new Date(item.FechaIngreso).toLocaleDateString('es-ES') : fecha}`,
      `y permanecerá en el taller hasta la finalización de las reparaciones.`,
      ``,
      `Este documento puede ser presentado a compañías de seguros como justificante de la`,
      `estancia del vehículo en el taller.`
    ];
    
    certificacion.forEach((line, index) => {
      doc.text(line, 20, 75 + (index * 5));
    });
    
    // Firma y sello
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Firma y sello del taller:', 105, 170, { align: 'center' });
    doc.line(80, 175, 130, 175);
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Documento emitido el ${fecha} a las ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`, 105, 190, { align: 'center' });
    
    return doc;
  }

  /**
   * Genera un presupuesto detallado con descuento para citas
   */
  static async generarPresupuesto(item, datosPresupuesto) {
    const doc = new jsPDF();
    
    // Configuración
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    
    // Header
    doc.text('PRESUPUESTO DE REPARACIÓN', 105, 25, { align: 'center' });
    
    // Información del taller
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(this.TALLER_INFO.nombre, 20, 40);
    doc.text(this.TALLER_INFO.direccion, 20, 45);
    doc.text(`Tel: ${this.TALLER_INFO.telefono}`, 20, 50);
    doc.text(`CIF: ${this.TALLER_INFO.cif}`, 20, 55);
    
    // Fecha y número
    const fecha = new Date().toLocaleDateString('es-ES');
    doc.text(`Fecha: ${fecha}`, 150, 40);
    doc.text(`Nº Presupuesto: PS-${item.Id}-${Date.now().toString().slice(-4)}`, 150, 45);
    doc.text(`Válido hasta: ${new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')}`, 150, 50);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 60, 190, 60);
    
    // Información del cliente y vehículo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('DATOS DEL CLIENTE Y VEHÍCULO', 20, 70);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Cliente: ${item.Nombre || 'No especificado'}`, 20, 80);
    doc.text(`Teléfono: ${item.Telefono || 'No especificado'}`, 20, 87);
    doc.text(`Email: ${item.Correo || 'No especificado'}`, 20, 94);
    doc.text(`Vehículo: ${item.Marca || ''} ${item.Modelo || ''}`, 120, 80);
    doc.text(`Matrícula: ${item.Matricula || 'No especificada'}`, 120, 87);
    doc.text(`Año: ${item.Anio || 'No especificado'}`, 120, 94);
    
    // Descripción del trabajo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPCIÓN DEL TRABAJO', 20, 110);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const descripcion = datosPresupuesto.descripcionTrabajo || item.Descripcion || 'Reparación y mantenimiento del vehículo';
    const descripcionLines = doc.splitTextToSize(descripcion, 170);
    doc.text(descripcionLines, 20, 120);
    
    // Tabla de trabajos y repuestos
    let yPosition = 140;
    
    // Trabajos/Mano de obra
    if (datosPresupuesto.trabajos && datosPresupuesto.trabajos.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('MANO DE OBRA', 20, yPosition);
      yPosition += 10;
      
      datosPresupuesto.trabajos.forEach((trabajo, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(trabajo.descripcion, 20, yPosition);
        doc.text(`${trabajo.horas} horas`, 120, yPosition);
        doc.text(`${this.formatearPrecio(trabajo.precioHora)}/h`, 150, yPosition);
        doc.text(this.formatearPrecio(trabajo.horas * trabajo.precioHora), 180, yPosition, { align: 'right' });
        yPosition += 7;
      });
      yPosition += 5;
    }
    
    // Repuestos
    if (datosPresupuesto.repuestos && datosPresupuesto.repuestos.length > 0) {
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('REPUESTOS Y MATERIALES', 20, yPosition);
      yPosition += 10;
      
      datosPresupuesto.repuestos.forEach((repuesto, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(repuesto.descripcion, 20, yPosition);
        doc.text(`${repuesto.cantidad} uds.`, 120, yPosition);
        doc.text(this.formatearPrecio(repuesto.precioUnitario), 150, yPosition);
        doc.text(this.formatearPrecio(repuesto.cantidad * repuesto.precioUnitario), 180, yPosition, { align: 'right' });
        yPosition += 7;
      });
      yPosition += 5;
    }
    
    // Calcular subtotal con descuento si es cita
    let subtotal = datosPresupuesto.subtotal;
    const esCita = item.origen === "cita";
    
    if (esCita) {
      subtotal = Math.max(0, subtotal - 10); // Aplicar descuento
    }

    const iva = subtotal * 0.21;
    const total = subtotal + iva;

    // Totales
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN DEL PRESUPUESTO', 20, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Mostrar descuento si es cita
    if (esCita) {
      const subtotalOriginal = datosPresupuesto.subtotal;
      doc.text('Subtotal original:', 120, yPosition);
      doc.text(this.formatearPrecio(subtotalOriginal), 180, yPosition, { align: 'right' });
      yPosition += 7;
      
      doc.text('Descuento por reserva:', 120, yPosition);
      doc.text(`- ${this.formatearPrecio(10)}`, 180, yPosition, { align: 'right' });
      yPosition += 7;
      
      doc.setDrawColor(200, 200, 200);
      doc.line(120, yPosition, 190, yPosition);
      yPosition += 5;
    }
    
    doc.text('Subtotal (sin IVA):', 120, yPosition);
    doc.text(this.formatearPrecio(subtotal), 180, yPosition, { align: 'right' });
    yPosition += 7;
    
    doc.text('IVA (21%):', 120, yPosition);
    doc.text(this.formatearPrecio(iva), 180, yPosition, { align: 'right' });
    yPosition += 7;
    
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', 120, yPosition);
    doc.text(this.formatearPrecio(total), 180, yPosition, { align: 'right' });

    // Agregar nota del descuento en condiciones si es cita
    if (esCita) {
      yPosition += 15;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 100, 0); // Verde para la nota
      doc.text('* Se ha aplicado el descuento del depósito de reserva de 10.00€', 20, yPosition);
    }

    // Condiciones y firmas
    yPosition += 20;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    
    const condiciones = [
      'Este presupuesto tiene una validez de 15 días.',
      'Los trabajos comenzarán previa autorización del cliente.',
      'Los precios incluyen mano de obra y materiales especificados.',
      'Cualquier trabajo adicional será presupuestado aparte.',
      'El taller no se responsabiliza de piezas no sustituidas.'
    ];
    
    condiciones.forEach((condicion, index) => {
      doc.text(condicion, 20, yPosition + (index * 4));
    });

    // Firmas
    doc.setFontSize(8);
    doc.text('Firma del cliente (conforme y autoriza el trabajo):', 30, yPosition + 30);
    doc.text('Firma del taller:', 130, yPosition + 30);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(30, yPosition + 35, 100, yPosition + 35);
    doc.line(130, yPosition + 35, 180, yPosition + 35);
    
    return doc;
  }

  /**
   * Genera factura a partir del presupuesto aceptado con descuento para citas
   */
  static async generarFactura(item, datosPresupuesto, numeroFactura) {
    const doc = new jsPDF();
    
    // Configuración
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    
    // Header
    doc.text('FACTURA', 105, 25, { align: 'center' });
    
    // Información del taller
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(this.TALLER_INFO.nombre, 20, 40);
    doc.text(this.TALLER_INFO.direccion, 20, 45);
    doc.text(`Tel: ${this.TALLER_INFO.telefono}`, 20, 50);
    doc.text(`CIF: ${this.TALLER_INFO.cif}`, 20, 55);
    
    // Fecha y número de factura
    const fecha = new Date().toLocaleDateString('es-ES');
    doc.text(`Fecha: ${fecha}`, 150, 40);
    doc.text(`Factura Nº: F-${numeroFactura}`, 150, 45);
    doc.text(`Nº Cliente: CL-${item.Id}`, 150, 50);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 60, 190, 60);
    
    // Información del cliente
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('DATOS DEL CLIENTE', 20, 70);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre: ${item.Nombre || 'No especificado'}`, 20, 80);
    doc.text(`Teléfono: ${item.Telefono || 'No especificado'}`, 20, 87);
    doc.text(`Vehículo: ${item.Marca || ''} ${item.Modelo || ''}`, 20, 94);
    doc.text(`Matrícula: ${item.Matricula || 'No especificada'}`, 20, 101);
    
    // Descripción
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CONCEPTO', 20, 115);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const concepto = `Reparación y mantenimiento vehículo ${item.Marca} ${item.Modelo} - ${item.Matricula}`;
    doc.text(concepto, 20, 125);
    
    // Desglose
    let yPosition = 140;
    
    // Trabajos
    if (datosPresupuesto.trabajos && datosPresupuesto.trabajos.length > 0) {
      datosPresupuesto.trabajos.forEach((trabajo) => {
        doc.text(`${trabajo.descripcion} - ${trabajo.horas} horas`, 20, yPosition);
        doc.text(this.formatearPrecio(trabajo.horas * trabajo.precioHora), 180, yPosition, { align: 'right' });
        yPosition += 7;
      });
    }
    
    // Repuestos
    if (datosPresupuesto.repuestos && datosPresupuesto.repuestos.length > 0) {
      datosPresupuesto.repuestos.forEach((repuesto) => {
        doc.text(`${repuesto.descripcion} - ${repuesto.cantidad} uds.`, 20, yPosition);
        doc.text(this.formatearPrecio(repuesto.cantidad * repuesto.precioUnitario), 180, yPosition, { align: 'right' });
        yPosition += 7;
      });
    }
    
    // Calcular con descuento si es cita
    let subtotal = datosPresupuesto.subtotal;
    const esCita = item.origen === "cita";
    
    if (esCita) {
      subtotal = Math.max(0, subtotal - 10);
    }

    const iva = subtotal * 0.21;
    const total = subtotal + iva;

    // Totales
    yPosition += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(120, yPosition, 190, yPosition);
    yPosition += 5;

    // Mostrar desglose del descuento si es cita
    if (esCita) {
      const subtotalOriginal = datosPresupuesto.subtotal;
      doc.text('Base Imponible Original:', 120, yPosition);
      doc.text(this.formatearPrecio(subtotalOriginal), 180, yPosition, { align: 'right' });
      yPosition += 7;
      
      doc.text('Descuento por reserva:', 120, yPosition);
      doc.text(`- ${this.formatearPrecio(10)}`, 180, yPosition, { align: 'right' });
      yPosition += 7;
      
      doc.setDrawColor(200, 200, 200);
      doc.line(120, yPosition, 190, yPosition);
      yPosition += 5;
    }

    doc.text('Base Imponible:', 120, yPosition);
    doc.text(this.formatearPrecio(subtotal), 180, yPosition, { align: 'right' });
    yPosition += 7;
    
    doc.text('IVA (21%):', 120, yPosition);
    doc.text(this.formatearPrecio(iva), 180, yPosition, { align: 'right' });
    yPosition += 7;
    
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', 120, yPosition);
    doc.text(this.formatearPrecio(total), 180, yPosition, { align: 'right' });

    // Agregar nota en formas de pago sobre el descuento
    yPosition += 20;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    
    if (esCita) {
      doc.text('* Se ha aplicado el descuento del depósito de reserva de 10.00€', 20, yPosition);
      yPosition += 5;
    }
    
    doc.text('Formas de pago aceptadas: Efectivo, Transferencia, Tarjeta', 20, yPosition);
    doc.text('Garantía: 12 meses en mano de obra y repuestos instalados', 20, yPosition + 5);
    doc.text('Factura emitida por sistema automatizado', 20, yPosition + 10);

    return doc;
  }

  /**
   * Obtiene el texto del estado en español
   */
  static obtenerTextoEstado(estado) {
    const estados = {
      'pendiente': 'Pendiente',
      'en_proceso': 'En Proceso',
      'finalizado': 'Finalizado',
      'revisado': 'Revisado'
    };
    
    return estados[estado] || estado;
  }

  /**
   * Formatea precios en formato euros
   */
  static formatearPrecio(precio) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(precio);
  }

  /**
   * Descarga el PDF
   */
  static descargarPDF(doc, nombreArchivo) {
    doc.save(nombreArchivo);
  }

  /**
   * Abre el PDF en nueva ventana
   */
  static abrirPDF(doc, nombreArchivo) {
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
    
    // Limpiar URL después de un tiempo
    setTimeout(() => {
      URL.revokeObjectURL(pdfUrl);
    }, 1000);
  }
}

export default PDFService;