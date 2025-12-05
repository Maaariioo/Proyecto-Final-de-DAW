import { useState } from "react";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/Registro.css";
import { UsuarioService } from "../../axios/index.js"; // Import corregido
import bcrypt from "bcryptjs";

function Registro() {
  const [form, setForm] = useState({
    correo: "",
    pass: "",
    confirm: "",
  });

  const navigate = useNavigate();
  const [errores, setErrores] = useState({});

  const gestionarCambio = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validarCorreoExistente = async (correo) => {
    try {
      const usuarioExistente = await UsuarioService.obtenerUsuarioPorCorreo(
        correo
      );
      return !!usuarioExistente; // Retorna true si el usuario existe
    } catch (error) {
      console.error("Error al validar correo:", error);
      return false;
    }
  };

  const validar = async () => {
    const nuevosErrores = {};

    // Validación de correo
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
      nuevosErrores.correo = "Por favor ingrese un correo válido";
    } else {
      // Validar si el correo ya existe (solo si el formato es válido)
      const correoExiste = await validarCorreoExistente(form.correo);
      if (correoExiste) {
        nuevosErrores.correo = "Este correo ya está registrado";
      }
    }

    // Validación de contraseña
    if (!form.pass.trim()) {
      nuevosErrores.pass = "La contraseña es obligatoria";
    } else if (form.pass.length < 8) {
      nuevosErrores.pass = "La contraseña debe tener al menos 8 caracteres";
    }

    // Validación de confirmación
    if (!form.confirm.trim()) {
      nuevosErrores.confirm = "Debe confirmar la contraseña";
    } else if (form.pass !== form.confirm) {
      nuevosErrores.confirm = "Las contraseñas no coinciden";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
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

    // Usar await para la validación asíncrona
    const esValido = await validar();

    if (esValido) {
      try {
        const contraseñaEncriptada = bcrypt.hashSync(form.pass, 10);

        // Usar el servicio modular
        await UsuarioService.registrarUsuario({
          correo: form.correo,
          pass: contraseñaEncriptada,
        });

        Toast.fire({
          title: "Registro exitoso",
          text: "Ya puedes iniciar sesión",
          icon: "success",
          confirmButtonColor: "var(--detalles-color)",
          background: "var(--form-bg)",
          color: "var(--text-color)",
        });

        navigate("/inicio-sesion");
      } catch (error) {
        console.error("Error en registro:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo registrar. Inténtalo de nuevo.",
        });
      }
    } else {
      Toast.fire({
        icon: "error",
        title: "El formulario tiene errores",
      });
    }
  };

  return (
    <div className="auth-hero">
      <form className="auth-card" onSubmit={enviarFormulario}>
        <div className="auth-header">
          <h2>Crear Cuenta</h2>
          <p className="subtitle">Regístrate para comenzar</p>
        </div>

        <div className="auth-field">
          <label htmlFor="correo">Correo electrónico</label>
          <input
            type="email"
            id="correo"
            name="correo"
            placeholder="tucorreo@ejemplo.com"
            value={form.correo}
            onChange={gestionarCambio}
          />
          {errores.correo && <p className="errores_IR">{errores.correo}</p>}
        </div>

        <div className="auth-field">
          <label htmlFor="pass">Contraseña</label>
          <input
            type="password"
            id="pass"
            name="pass"
            placeholder="••••••••"
            value={form.pass}
            onChange={gestionarCambio}
          />
          {errores.pass && <p className="errores_IR">{errores.pass}</p>}
        </div>

        <div className="auth-field">
          <label htmlFor="confirm">Confirmar Contraseña</label>
          <input
            type="password"
            id="confirm"
            name="confirm"
            placeholder="••••••••"
            value={form.confirm}
            onChange={gestionarCambio}
          />
          {errores.confirm && <p className="errores_IR">{errores.confirm}</p>}
        </div>

        <button type="submit" className="auth-button">
          Registrarme
        </button>

        <div className="auth-footer">
          <span>¿Ya tienes cuenta? </span>
          <Link to="/inicio-sesion" className="auth-link">
            Inicia Sesión
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Registro;
