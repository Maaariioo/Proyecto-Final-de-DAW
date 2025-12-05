import React from "react";
import "../../styles/DetalleServicio.css";

function DetalleServicio({ servicio }) {
  if (!servicio) {
    return (
      <div className="detalle-servicio">
        <div className="selecciona-servicio">
          <div className="icono-seleccion">🔧</div>
          <p>Selecciona un servicio</p>
        </div>
      </div>
    );
  }

  const caracteristicasValidas = Array.isArray(servicio.caracteristicas)
    ? servicio.caracteristicas
    : [];

  return (
    <div className="detalle-servicio">
      <div className="servicio-header">
        <div className="servicio-info-principal">
          <h1 className="servicio-titulo">{servicio.nombre}</h1>
        </div>
        <div className="servicio-precio-container">
          <span className="servicio-precio">{servicio.precio}€</span>
        </div>
      </div>

      <div className="servicio-imagen-container">
        <img
          src={servicio.imagen}
          alt={servicio.nombre}
          className="servicio-imagen"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://via.placeholder.com/600x300/2c3e50/ecf0f1?text=Imagen+No+Disponible";
          }}
        />
      </div>

      <div className="servicio-info">
        <div className="servicio-descripcion">
          <h3>Descripción</h3>
          <p>{servicio.descripcion}</p>
        </div>

        {caracteristicasValidas.length > 0 && (
          <div className="servicio-caracteristicas">
            <h3>Características</h3>
            <ul>
              {caracteristicasValidas.map((caracteristica, index) => (
                <li key={index}>
                  <span className="check-icon">•</span>
                  {caracteristica}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default DetalleServicio;
