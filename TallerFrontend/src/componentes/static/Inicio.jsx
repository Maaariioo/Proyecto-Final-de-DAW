import { Link } from "react-router-dom";
import { useEffect } from "react";
import Swal from "sweetalert2";
import "../../styles/Inicio.css";

function Inicio() {
  useEffect(() => {
    const mensaje = localStorage.getItem("mensajeAccesoDenegado");
    if (mensaje) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: mensaje,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      localStorage.removeItem("mensajeAccesoDenegado");
    }
  }, []);

  return (
    <div className="contenido">
      <div className="inicio seccion-inicio">
        <div className="hero">
          <h2>Expertos en cuidado de tu vehículo</h2>
          <p>
            Déjalo <strong>en nuestras manos.</strong>
          </p>
          <h4>
            <Link to="/sobre-nosotros">Sobre Nosotros</Link>
          </h4>
        </div>

        <div className="tarjetas-destacadas">
          <div className="tarjeta">
            <div className="icono-tarjeta">🛠️</div>
            <h3>Mecánica General</h3>
            <p>
              Reparaciones y mantenimiento para todos los modelos de vehículos
            </p>
          </div>
          <div className="tarjeta">
            <div className="icono-tarjeta">🔧</div>
            <h3>Diagnóstico Preciso</h3>
            <p>Tecnología de última generación para identificar problemas</p>
          </div>
          <div className="tarjeta">
            <div className="icono-tarjeta">⏱️</div>
            <h3>Rápido y Eficiente</h3>
            <p>Soluciones rápidas sin comprometer la calidad del trabajo</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Inicio;
