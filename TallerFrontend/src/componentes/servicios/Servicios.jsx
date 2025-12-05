import React, { useState, useEffect, useRef } from "react";
import "../../styles/Servicios.css";
import { ServicioService } from "../../axios/index.js";
import Swal from "sweetalert2";
import DetalleServicio from "./DetalleServicio.jsx";

function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const scrollContainer = useRef(null);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  useEffect(() => {
    ServicioService.obtenerServicios()
      .then((response) => {
        setServicios(response.data);
      })
      .catch((error) => {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se han podido cargar los servicios. Disculpe las molestias.",
        });
      });
  }, []);

  const seleccionarServicio = (servicio) => {
    setServicioSeleccionado(servicio);

    // En móvil, hacer scroll suave al detalle
    if (isMobile) {
      setTimeout(() => {
        const detailContainer = document.querySelector(
          ".servicio-detalle-container"
        );
        if (detailContainer) {
          detailContainer.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    }
  };

  // Scroll horizontal con rueda del mouse
  useEffect(() => {
    const container = scrollContainer.current;
    if (container) {
      const handleWheel = (e) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          container.scrollLeft += e.deltaY;
        }
      };

      // Solo en desktop
      if (!isMobile) {
        container.addEventListener("wheel", handleWheel);
      }

      return () => {
        if (!isMobile) {
          container.removeEventListener("wheel", handleWheel);
        }
      };
    }
  }, [isMobile]);

  return (
    <div className="servicios-page">
      <div className="servicios-header">
        <h1>Nuestros Servicios</h1>
        <p>Seleccione un servicio para conocer todos los detalles</p>
      </div>

      <div className="servicios-scroll-container" ref={scrollContainer}>
        <div className="servicios-list">
          {servicios.map((servicio) => (
            <div
              key={servicio.id}
              className={`servicio-card ${
                servicioSeleccionado?.id === servicio.id ? "active" : ""
              }`}
              onClick={() => seleccionarServicio(servicio)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  seleccionarServicio(servicio);
                }
              }}
            >
              <h3>{servicio.nombre}</h3>
              {servicio.precio && (
                <div className="servicio-precio-mini">
                  Desde {servicio.precio}€
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Indicador de scroll para móvil */}
      {isMobile && servicios.length > 0 && (
        <div className="mobile-scroll-hint">
          ← Desliza para ver más servicios →
        </div>
      )}

      <div className="servicio-detalle-container">
        {servicioSeleccionado ? (
          <DetalleServicio
            servicio={servicioSeleccionado}
            isMobile={isMobile}
          />
        ) : (
          <div className="mensaje-seleccion-container">
            <div className="mensaje-seleccion">
              <h2>Selecciona un servicio</h2>
              <p>
                {isMobile
                  ? "Toca en un servicio de la lista para ver todos sus detalles y opciones disponibles"
                  : "Haz clic en un servicio de la lista para ver todos sus detalles y opciones disponibles"}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="servicios-footer">
        <strong>¿No encuentras lo que buscas?</strong>
        {isMobile ? <br /> : " "}
        Llámanos al +34 671 347 158 para una atención personalizada
      </div>
    </div>
  );
}

export default Servicios;
