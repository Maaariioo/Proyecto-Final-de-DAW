import React from "react";
import "../../styles/SobreNosotros.css";

function SobreNosotros() {
  return (
    <div className="contenido">
      <div className="sobre-nosotros">
        <div className="tarjeta-flotante">
          <h2>Expertos en hacerlo bien desde hace 30 años</h2>
          <p>
            No somos el taller más grande,{" "}
            <strong>pero sí uno de los más fiables.</strong>
          </p>
        </div>

        <div className="ventajas-container">
          <h2 className="titulo-seccion">¿Por qué nos eligen?</h2>
          <div className="ventajas-grid">
            <div className="ventaja-card">
              <div className="ventaja-icono">🏎️</div>
              <h3>Todas las marcas</h3>
              <p>Especialistas en mecánica general para cualquier vehículo</p>
            </div>
            <div className="ventaja-card">
              <div className="ventaja-icono">⏱️</div>
              <h3>Rapidez</h3>
              <p>Diagnóstico inmediato y reparaciones sin esperas</p>
            </div>
            <div className="ventaja-card">
              <div className="ventaja-icono">🛡️</div>
              <h3>Garantía</h3>
              <p>Todas nuestras reparaciones incluyen garantía</p>
            </div>
            <div className="ventaja-card">
              <div className="ventaja-icono">💶</div>
              <h3>Honestidad</h3>
              <p>Presupuestos claros sin sorpresas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SobreNosotros;
