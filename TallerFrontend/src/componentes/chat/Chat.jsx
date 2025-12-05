import { useState, useRef, useEffect } from "react";
import "../../styles/Chat.css";

const Chat = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "¡Hola! Soy tu asistente virtual del taller. ¿En qué puedo ayudarte hoy con tu vehículo?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  //token de Hugging Face
  const HF_TOKEN = "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";

  // Desplazar hacia abajo automáticamente cuando hay nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  // Función para procesar HTML/markdown a texto plano mejorado
  const processAIResponse = (text) => {
    if (!text) return "";

    let processed = text
      // Convertir tablas a formato legible
      .replace(/\|([^|]+)\|([^|]+)\|([^|]+)\|/g, "\n• $1: $2 | $3")
      .replace(/\|-+/g, "") // Remover separadores de tabla
      // Convertir listas markdown
      .replace(/\d+\.\s+/g, "\n• ")
      .replace(/\*\*\s*/g, "\n• ")
      // Limpiar formato markdown pero mantener énfasis
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/#{1,6}\s?/g, "")
      // Convertir saltos de línea HTML
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/?[^>]+(>|$)/g, "") // Quitar otras etiquetas HTML
      // Limpiar espacios múltiples
      .replace(/\n\s*\n/g, "\n\n")
      .replace(/ +/g, " ")
      .trim();

    return processed;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim()) return;

    // Agregar mensaje del usuario
    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Intenta con la API primero
      let response;
      try {
        const apiResponse = await getAIResponseFromAPI(inputMessage);
        response = processAIResponse(apiResponse);
      } catch (apiError) {
        console.log("API no disponible, usando respuestas predefinidas");
        response = getFallbackResponse(inputMessage);
      }

      const botMessage = {
        id: messages.length + 2,
        text: response,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);

      const errorMessage = {
        id: messages.length + 2,
        text: "Lo siento, hay un problema temporal. Por favor, contacta directamente con el taller al +34 671 347 158",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  const getAIResponseFromAPI = async (message) => {
    try {
      console.log("Enviando mensaje a la API...");
      const response = await fetch(
        "https://router.huggingface.co/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-120b:groq",
            messages: [
              {
                role: "system",
                content: `Eres un asistente especializado en taller mecánico. 
                Información del taller:
                - Dirección: Calle Puerto Rico 5, Chamartín, 28016 Madrid
                - Teléfono: +34 671 347 158
                - Horario: Lunes a Viernes 8:00-18:00, Sábados 9:00-13:00
                
                Responde de manera útil, profesional y detallada.
                Proporciona información completa sin límites de longitud.
                Usa solo texto plano sin formato markdown ni tablas.
                Sé muy específico y técnico cuando sea necesario.`,
              },
              {
                role: "user",
                content: message,
              },
            ],
            temperature: 0.7,
            stream: false,
          }),
        }
      );
      console.log("Status de respuesta:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error detallado:", errorText);

        if (response.status === 400) {
          throw new Error(
            "Solicitud incorrecta. Probando método alternativo..."
          );
        }
        if (response.status === 429) {
          throw new Error("Límite de uso excedido.");
        }
        if (response.status === 503) {
          throw new Error("Servicio no disponible.");
        }

        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log("Respuesta completa:", data);

      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content;
      } else {
        throw new Error("Formato de respuesta inesperado");
      }
    } catch (error) {
      console.error("Error llamando a la API:", error.message);

      // Si falla el primer método, probar con inference simple
      if (error.message.includes("Probando método alternativo")) {
        return await getAIResponseAlternative(message);
      }

      throw error;
    }
  };

  // Método alternativo usando inference directo
  const getAIResponseAlternative = async (message) => {
    try {
      console.log("Probando método alternativo...");

      const response = await fetch(
        "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: `Eres un asistente de taller mecánico. Taller en Calle Puerto Rico 5, Madrid. Tel: +34 671 347 158. Horario: L-V 8:00-18:00, S 9:00-13:00.

Usuario: ${message}
Asistente:`,
            parameters: {
              max_new_tokens: 500,
              temperature: 0.7,
              do_sample: true,
              return_full_text: false,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data && data[0] && data[0].generated_text) {
        return data[0].generated_text;
      } else {
        throw new Error(
          "Formato de respuesta inesperado en método alternativo"
        );
      }
    } catch (error) {
      console.error("Error en método alternativo:", error);
      throw error;
    }
  };

  // Función de respuestas predefinidas mejoradas y más detalladas
  const getFallbackResponse = (message) => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("hola") || lowerMessage.includes("buenas")) {
      return "¡Hola! 👋 Soy tu asistente virtual del taller mecánico. Estoy aquí para ayudarte con cualquier consulta sobre tu vehículo. Puedo asistirte con información sobre servicios de mantenimiento, diagnóstico de problemas comunes, precios aproximados, horarios de atención y programación de citas. También puedo orientarte sobre problemas específicos que pueda estar presentando tu coche. ¿En qué puedo ayudarte hoy?";
    } else if (
      lowerMessage.includes("precio") ||
      lowerMessage.includes("cuánto") ||
      lowerMessage.includes("cuesta")
    ) {
      return "💰 **Información detallada de precios aproximados:**\n\n• Cambio de aceite y filtro: Desde 50€ (dependiendo del tipo de aceite y vehículo)\n• Pastillas de freno delanteras: Desde 80€ (incluye mano de obra)\n• Pastillas de freno traseras: Desde 70€\n• Disco de freno delantero: Desde 120€ el par\n• Cambio de neumáticos: Desde 45€ por unidad (más costo de neumáticos)\n• Alineación y equilibrado: 40€\n• Revisión general completa: 30€ (diagnóstico exhaustivo)\n• Cambio de batería: Desde 90€ (incluye batería básica)\n• Cambio de correa de distribución: Desde 250€ (varía según modelo)\n\nEstos son precios orientativos. Para una cotización exacta y personalizada según tu vehículo y las necesidades específicas, te recomiendo contactarnos al +34 671 347 158. Realizamos presupuesto sin compromiso.";
    } else if (
      lowerMessage.includes("horario") ||
      lowerMessage.includes("hora") ||
      lowerMessage.includes("abierto")
    ) {
      return "🕒 **Horarios de atención detallados:**\n\nLunes a Viernes:\n• Mañanas: 8:00 - 14:00\n• Tardes: 15:00 - 18:00\n\nSábados:\n• Solo mañanas: 9:00 - 13:00\n\nDomingos y festivos: Cerrado\n\nDurante nuestro horario de atención puedes:\n• Traer tu vehículo para reparación\n• Recoger tu coche reparado\n• Solicitar presupuestos\n• Consultar sobre servicios\n• Programar citas futuras\n\n¿Te gustaría programar una cita específica? Puedes llamarnos para coordinar el día y hora que mejor te convenga.";
    } else if (
      lowerMessage.includes("aceite") ||
      lowerMessage.includes("cambio")
    ) {
      return "🛢️ **Información completa sobre cambio de aceite:**\n\n• Frecuencia recomendada:\n  - Vehículos gasolina: Cada 15,000 km o 1 año\n  - Vehículos diésel: Cada 10,000-12,000 km o 1 año\n  - Vehículos antiguos: Cada 5,000-7,000 km\n\n• Tipos de aceite que utilizamos:\n  - Sintético 5W-30/5W-40 (alto rendimiento)\n  - Semi-sintético 10W-40 (equilibrado)\n  - Mineral 15W-40 (vehículos clásicos)\n\n• Servicio completo incluye:\n  - Aceite de calidad premium\n  - Cambio de filtro de aceite\n  - Revisión de niveles de otros fluidos\n  - Inspección visual de fugas\n  - Reset del indicador de mantenimiento\n\n• Beneficios del cambio regular:\n  - Mejor lubricación del motor\n  - Reducción del desgaste\n  - Menor consumo de combustible\n  - Mayor vida útil del motor\n\n¿Qué tipo de vehículo tienes y cuántos kilómetros ha recorrido desde el último cambio?";
    } else if (
      lowerMessage.includes("frenos") ||
      lowerMessage.includes("freno")
    ) {
      return "🛑 **Sistema de frenos - Guía completa:**\n\n• Señales de alerta que indican revisión urgente:\n  - Ruido metálico o chirrido al frenar\n  - Vibración en el pedal o volante\n  - Pedal de freno blando o esponjoso\n  - Distancia de frenado aumentada\n  - Testigo de frenos en el cuadro\n  - El coche tira hacia un lado al frenar\n\n• Duración aproximada de componentes:\n  - Pastillas delanteras: 40,000-60,000 km\n  - Pastillas traseras: 60,000-80,000 km\n  - Discos de freno: 60,000-100,000 km\n  - Líquido de frenos: Cambio cada 2 años\n\n• Revisión recomendada:\n  - Inspección visual cada 20,000 km\n  - Medición de desgaste cada revisión\n  - Cambio de líquido cada 2 años\n\n• Nuestro servicio de frenos incluye:\n  - Diagnóstico computerizado\n  - Medición de desgaste de todos los componentes\n  - Presupuesto detallado sin compromiso\n  - Garantía en todos los repuestos\n\n¿Has notado alguno de estos síntomas en tu vehículo?";
    } else if (
      lowerMessage.includes("motor") ||
      lowerMessage.includes("falla") ||
      lowerMessage.includes("problema")
    ) {
      return "🔧 **Diagnóstico de problemas de motor - Asistencia profesional:**\n\nProblemas comunes y sus posibles causas:\n\n• Motor se para o falla:\n  - Problemas de combustible (bomba, filtro, inyectores)\n  - Fallos de encendido (bujías, bobinas, cables)\n  - Sensores defectuosos (MAF, TPS, sensor cigüeñal)\n  - Problemas eléctricos (alternador, batería)\n\n• Sobrecalentamiento:\n  - Nivel bajo de refrigerante\n  - Termostato defectuoso\n  - Ventilador del radiador no funciona\n  - Bomba de agua averiada\n\n• Pérdida de potencia:\n  - Filtro de aire obstruido\n  - Problemas en el turbo (si lo tiene)\n  - Escape o catalizador obstruido\n  - Válvula EGR sucia\n\n• Ruidos anormales:\n  - Golpeteo (problemas de combustión)\n  - Chirrido (correas)\n  - Traqueteo (partes mecánicas)\n  - Silbido (fugas de vacío)\n\n• Humo del escape:\n  - Humo blanco (refrigerante en combustión)\n  - Humo azul (quemando aceite)\n  - Humo negro (exceso de combustible)\n\nPara un diagnóstico preciso, necesitaría que me describas:\n1. Qué síntomas exactos presenta\n2. Cuándo comenzaron los problemas\n3. Si hay testigos en el cuadro\n4. Qué modelo y año es tu vehículo\n\n¿Puedes proporcionarme más detalles?";
    } else if (
      lowerMessage.includes("neumático") ||
      lowerMessage.includes("llanta") ||
      lowerMessage.includes("rueda")
    ) {
      return "🚗 **Neumáticos - Información completa:**\n\n• Presiones recomendadas (consultar manual del vehículo):\n  - Normal: 2.2-2.5 bares (32-36 PSI)\n  - Carga pesada: +0.2-0.3 bares\n  - Autopista: verificar presión en frío\n\n• Indicadores de desgaste:\n  - Testigos de desgaste (1.6mm mínimo legal)\n  - Desgaste irregular (alineación necesaria)\n  - Abultamientos o deformaciones\n  - Cortes o daños en flancos\n\n• Servicios que ofrecemos:\n  - Cambio de neumáticos\n  - Equilibrado computerizado\n  - Alineación 3D precisa\n  - Reparación de pinchazos\n  - Rotación de neumáticos\n\n• Marcas que trabajamos:\n  - Premium: Michelin, Bridgestone, Continental\n  - Calidad-precio: Goodyear, Pirelli, Hankook\n  - Económicas: Dunlop, Firestone, Kumho\n\n¿Necesitas cambio de neumáticos o revisión de los actuales?";
    } else if (
      lowerMessage.includes("batería") ||
      lowerMessage.includes("arranque")
    ) {
      return "🔋 **Baterías - Guía completa:**\n\n• Duración media:\n  - Baterías estándar: 3-5 años\n  - Baterías premium: 4-6 años\n  - Baterías AGM/Gel: 5-7 años\n\n• Síntomas de batería débil:\n  - Arranque lento o dificultoso\n  - Luces tenues o parpadeantes\n  - Problemas eléctricos intermitentes\n  - Testigo de batería en el cuadro\n  - Centralita con fallos aleatorios\n\n• Tipos de batería:\n  - Estándar (plomo-ácido)\n  - AGM (para start-stop)\n  - Gel (alta performance)\n  - Litio (vehículos especiales)\n\n• Servicio de batería incluye:\n  - Test de carga y estado actual\n  - Verificación del alternador\n  - Instalación profesional\n  - Gestión de residuos\n  - Reprogramación si es necesario\n\n¿Tu vehículo tiene problemas para arrancar?";
    } else {
      return "🤔 **Asistencia completa para tu taller mecánico**\n\nEntiendo tu consulta y estoy aquí para ayudarte de manera integral. Como asistente especializado en taller mecánico, puedo proporcionarte:\n\n• **Diagnóstico técnico** de problemas comunes y complejos\n• **Guías de mantenimiento** preventivo personalizadas\n• **Información detallada** sobre servicios y reparaciones\n• **Orientación profesional** sobre próximos pasos a seguir\n• **Coordinación de citas** y horarios disponibles\n• **Asesoramiento sobre costes** y opciones de reparación\n\nEspecialidades técnicas:\n- Motores de gasolina y diésel\n- Sistemas de frenos y suspensión\n- Transmisiones manuales y automáticas\n- Sistemas eléctricos y electrónicos\n- Climatización y aire acondicionado\n- Diagnóstico computerizado\n\nPara brindarte la mejor asistencia, ¿podrías contarme más detalles sobre lo que necesitas? También puedes contactarnos directamente al +34 671 347 158 para hablar con nuestros mecánicos especializados.";
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Función para renderizar texto con saltos de línea
  const renderTextWithLineBreaks = (text) => {
    return text.split("\n").map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split("\n").length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="chat-modal-header">
          <h3>💬 Asistente del Taller</h3>
          <button className="chat-close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${
                message.sender === "user" ? "user-message" : "bot-message"
              }`}
            >
              <div className="message-content">
                <p>{renderTextWithLineBreaks(message.text)}</p>
                <span className="message-time">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message bot-message">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Escribe tu pregunta sobre el taller..."
            disabled={isLoading}
            autoFocus
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="send-button"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
