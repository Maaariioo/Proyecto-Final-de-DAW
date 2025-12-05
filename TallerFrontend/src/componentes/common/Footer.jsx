import "../../styles/Footer.css";
import { useState } from "react";
import ChatHelp from "../chat/Chat.jsx";

function Footer() {
  const direccion = "Calle Puerto Rico 5, Chamartín, 28016 Madrid";
  const telefono = "+34 671 347 158";
  const email = "contacto@tallermecanico.com";
  const linkMaps =
    "https://maps.google.com/?q=Calle+Puerto+Rico+5,+Chamartin,+28016+Madrid";

  const [showMapModal, setShowMapModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);

  const handleOpenMap = (e) => {
    e.preventDefault();
    setShowMapModal(true);
  };

  const handleCloseMap = () => {
    setShowMapModal(false);
  };

  const handleGoToGoogleMaps = () => {
    window.open(linkMaps, "_blank", "noopener,noreferrer");
  };

  const handleOpenChat = (e) => {
    e.preventDefault();
    setShowChatModal(true);
  };

  const handleCloseChat = () => {
    setShowChatModal(false);
  };

  const handleCopyToClipboard = async (text, type) => {
    try {
      // Método moderno con navigator.clipboard
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Método fallback para navegadores más antiguos o HTTP
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand("copy");
        if (!successful) {
          throw new Error("Fallback copy method failed");
        }

        document.body.removeChild(textArea);
      }

      setActiveTooltip(type);
      setTimeout(() => setActiveTooltip(null), 2000);
    } catch (err) {
      console.error("Error al copiar al portapapeles:", err);
      // Fallback: mostrar el texto para copiar manualmente
      alert(`No se pudo copiar automáticamente. El ${type} es: ${text}`);
    }
  };

  const mapEmbedUrl = `https://maps.google.com/maps?q=Calle+Puerto+Rico+5,Chamartin,28016+Madrid&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <>
      <footer className="footer" id="footer">
        <div className="footer-content">
          <nav className="lista_footer" id="lista_footer">
            <ul>
              <li
                className="footer-item telefonoFooter"
                id="telefonoFooter"
                onClick={() => handleCopyToClipboard(telefono, "telefono")}
              >
                <span className="footer-text">Teléfono</span>
                <span
                  className={`tooltip ${
                    activeTooltip === "telefono" ? "tooltip-copied" : ""
                  }`}
                >
                  {activeTooltip === "telefono" ? "✓ Copiado!" : telefono}
                </span>
              </li>
              <li className="footer-item">
                <a href="#" onClick={handleOpenMap} className="footer-link">
                  <span className="footer-text">Ubicación</span>
                </a>
              </li>

              <li className="footer-item">
                <a
                  href="#"
                  onClick={handleOpenChat}
                  className="footer-link chat-help-link"
                >
                  <span className="footer-text">Ayuda Rápida</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </footer>

      {/* Modal del Mapa */}
      {showMapModal && (
        <div className="modal-overlay" onClick={handleCloseMap}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nuestra Ubicación</h3>
              <button className="close-button" onClick={handleCloseMap}>
                <span>×</span>
              </button>
            </div>

            <div className="map-container">
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación en Google Maps"
              ></iframe>
            </div>

            <div className="modal-footer">
              <div className="modal-actions">
                <button
                  className="btn-primary maps-button"
                  onClick={handleGoToGoogleMaps}
                >
                  Abrir en Google Maps
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Componente del Chat */}
      {showChatModal && <ChatHelp onClose={handleCloseChat} />}
    </>
  );
}

export default Footer;
