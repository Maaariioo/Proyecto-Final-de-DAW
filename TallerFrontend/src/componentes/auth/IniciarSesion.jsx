import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "../../styles/InicioS.css";
import { Link, useNavigate } from "react-router-dom";
import { UsuarioService } from "../../axios/index.js"; // Import corregido
import bcrypt from "bcryptjs";
import { useAuth } from "./AuthProvider.jsx";

function IniciarSesion() {
  const [form, setForm] = useState({ correo: "", password: "" });
  const [errores, setErrores] = useState({});
  const navigate = useNavigate();
  const { login, usuario } = useAuth();

  const gestionarCambio = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  useEffect(() => {
    if (usuario) {
      navigate("/");
    }
  }, [usuario, navigate]);

  const validar = () => {
    const nuevosErrores = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
      nuevosErrores.correo = "Por favor ingrese un correo válido";
    }

    if (!form.password.trim()) {
      nuevosErrores.password = "La contraseña es requerida";
    } else if (form.password.length < 8) {
      nuevosErrores.password = "La contraseña debe tener al menos 8 caracteres";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const loginExitoso = (usuarioData) => {
    localStorage.setItem("usuario", JSON.stringify(usuarioData));
    login(usuarioData);
    window.location.href = "/";
  };

  const enviarFormulario = async (e) => {
    e.preventDefault();

    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });

    if (!validar()) {
      Toast.fire({
        icon: "error",
        title: "El formulario tiene errores",
      });
      return;
    }

    try {
      const usuarioData = await UsuarioService.obtenerUsuarioPorCorreo(
        form.correo
      );

      console.log("🔍 Usuario obtenido:", usuarioData);

      if (!usuarioData) {
        Toast.fire({
          icon: "error",
          title: "Usuario no encontrado",
        });
        return;
      }

      const contrasenaCoincide = bcrypt.compareSync(
        form.password,
        usuarioData.pass
      );
      console.log("Contraseña coincide?:", contrasenaCoincide);

      if (contrasenaCoincide) {
        Toast.fire({
          icon: "success",
          title: "Bienvenido",
        });
        loginExitoso(usuarioData);
      } else {
        Toast.fire({
          icon: "error",
          title: "Contraseña incorrecta",
        });
      }
    } catch (error) {
      console.error("Error al verificar el usuario:", error);
      Toast.fire({
        icon: "error",
        title: "Error al iniciar sesión. Inténtalo de nuevo más tarde.",
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-background"></div>
      <div className="login-decoration decoration-1"></div>
      <div className="login-decoration decoration-2"></div>

      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Iniciar Sesión</h1>
        </div>

        <form className="login-form" onSubmit={enviarFormulario}>
          <div className="form-group">
            <label htmlFor="correo">Correo electrónico</label>
            <input
              type="email"
              id="correo"
              name="correo"
              placeholder="ejemplo@taller.com"
              value={form.correo}
              onChange={gestionarCambio}
            />
            {errores.correo && (
              <span className="errores_IR">{errores.correo}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={gestionarCambio}
            />
            {errores.password && (
              <span className="errores_IR">{errores.password}</span>
            )}
          </div>

          <button type="submit" className="login-button">
            Iniciar Sesión
          </button>
        </form>

        <div className="login-footer">
          ¿Necesitas ayuda?{" "}
          <Link to="/registro" className="login-link">
            Crea una cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}

export default IniciarSesion;
