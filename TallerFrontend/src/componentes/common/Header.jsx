import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/Header.css";
import AdminLinks from "../common/AdminLinks.jsx";
import { useAuth } from "../auth/AuthProvider.jsx";

function Header() {
  const [modoNoche, setModoNoche] = useState(() => {
    const temaGuardado = sessionStorage.getItem("modoNoche");
    return temaGuardado ? JSON.parse(temaGuardado) : false;
  });

  const [modalAbiertoAdmin, setModalAbiertoAdmin] = useState(false);
  const [logueado, setLogueado] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [mecanico, setMecanico] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));

    setLogueado(!!usuarioGuardado);
    setAdmin(usuarioGuardado?.admin);
    setMecanico(usuarioGuardado?.mecanico);

    sessionStorage.setItem("modoNoche", JSON.stringify(modoNoche));
    const tema = modoNoche ? "oscuro" : "claro";
    document.documentElement.setAttribute("tema", tema);
  }, [modoNoche]);

  const mandarAlInicio = () => {
    navigate("/");
    setMenuMovilAbierto(false);
  };

  const cambiarModoNoche = () => {
    setModoNoche(!modoNoche);
  };

  const abrirModalAdmin = () => {
    setModalAbiertoAdmin(true);
  };

  const cerrarModalAdmin = () => {
    setModalAbiertoAdmin(false);
  };

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    setLogueado(false);
    setAdmin(false);
    setMecanico(false);
    setMenuMovilAbierto(false);
    navigate("/inicio-sesion");
    logout();
  };

  const toggleMenuMovil = () => {
    setMenuMovilAbierto(!menuMovilAbierto);
  };

  const navegarYcerrarMenu = (ruta) => {
    navigate(ruta);
    setMenuMovilAbierto(false);
  };

  return (
    <header className="header" id="header">
      <img
        className="header-logo"
        src="logo.png"
        alt="Logo"
        onClick={mandarAlInicio}
        style={{ cursor: "pointer" }}
      />

      {/* Botón menú móvil */}
      <button
        className="menu-movil-toggle"
        onClick={toggleMenuMovil}
        aria-label="Abrir menú"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Navegación desktop */}
      <nav className="header-nav">
        <ul>
          <Link to="/">
            <li className="btnInicio" id="btnInicio">
              Inicio
            </li>
          </Link>
          <Link to="/servicios">
            <li className="btnServicios" id="btnServicios">
              Servicios
            </li>
          </Link>
          <Link to="/pedir-cita">
            <li className="btnPedirCita" id="btnPedirCita">
              Pedir Cita
            </li>
          </Link>
          {/* Link al Planner solo para trabajadores/mecánicos */}
          {mecanico && (
            <Link to="/planner">
              <li className="btnPlanner" id="btnPlanner">
                Planner
              </li>
            </Link>
          )}
        </ul>
      </nav>

      <div className="contenedor-derecha">
        <div className="contenedor-botones-acceso">
          {!logueado ? (
            <>
              <button
                className="boton-acceso boton-login"
                onClick={() => navigate("/inicio-sesion")}
              >
                Iniciar Sesión
              </button>
              <button
                className="boton-acceso boton-registro"
                onClick={() => navigate("/registro")}
              >
                Registrarse
              </button>
            </>
          ) : (
            <>
              {admin && (
                <button
                  className="boton-acceso boton-admin"
                  onClick={abrirModalAdmin}
                >
                  👷🏻‍
                </button>
              )}
              <button
                className="boton-acceso boton-cerrar-sesion"
                onClick={cerrarSesion}
              >
                Cerrar Sesión
              </button>
            </>
          )}
        </div>

        <div className="switch-container">
          <label className="switch">
            <input
              type="checkbox"
              className="dmToggle"
              checked={modoNoche}
              onChange={cambiarModoNoche}
            />
            <span className="slider">
              <span className="star star_1"></span>
              <span className="star star_2"></span>
              <span className="star star_3"></span>
              <span className="cloud"></span>
            </span>
          </label>
        </div>
      </div>

      {/* Menú móvil */}
      <div
        className={`menu-movil ${
          menuMovilAbierto ? "menu-movil--abierto" : ""
        }`}
      >
        <div className="menu-movil-contenido">
          <button className="cerrar-menu-movil" onClick={toggleMenuMovil}>
            ×
          </button>

          <nav className="menu-movil-nav">
            <ul>
              <li>
                <Link to="/" onClick={toggleMenuMovil}>
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/servicios" onClick={toggleMenuMovil}>
                  Servicios
                </Link>
              </li>
              <li>
                <Link to="/pedir-cita" onClick={toggleMenuMovil}>
                  Pedir Cita
                </Link>
              </li>
              {/* Link al Planner solo para trabajadores/mecánicos en móvil */}
              {mecanico && (
                <li>
                  <Link to="/planner" onClick={toggleMenuMovil}>
                    Planner
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          <div className="menu-movil-botones">
            {!logueado ? (
              <>
                <button
                  className="boton-acceso boton-login"
                  onClick={() => navegarYcerrarMenu("/inicio-sesion")}
                >
                  Iniciar Sesión
                </button>
                <button
                  className="boton-acceso boton-registro"
                  onClick={() => navegarYcerrarMenu("/registro")}
                >
                  Registrarse
                </button>
              </>
            ) : (
              <>
                {admin && (
                  <button
                    className="boton-acceso boton-admin-movil"
                    onClick={() => {
                      abrirModalAdmin();
                      toggleMenuMovil();
                    }}
                  >
                    👷🏻‍ Panel Admin
                  </button>
                )}
                <button
                  className="boton-acceso boton-cerrar-sesion"
                  onClick={cerrarSesion}
                >
                  Cerrar Sesión
                </button>
              </>
            )}
          </div>

          <div className="menu-movil-switch">
            <span>🌙 Modo oscuro</span>
            <label className="switch">
              <input
                type="checkbox"
                className="dmToggle"
                checked={modoNoche}
                onChange={cambiarModoNoche}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>

      {modalAbiertoAdmin && (
        <div className="modal-admin-overlay" onClick={cerrarModalAdmin}>
          <div
            className="modal-admin-container"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="cerrar-modal-admin" onClick={cerrarModalAdmin}>
              ✕
            </button>
            <AdminLinks onClose={cerrarModalAdmin} />
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
