import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";

const RutasTrabajador = ({ children, permitirAdmin = false }) => {
  const { usuario } = useAuth();

  if (!usuario) {
    localStorage.setItem(
      "mensajeAccesoDenegado",
      "Debes iniciar sesión para acceder a esta página"
    );
    return <Navigate to="/inicio-sesion" replace />;
  }

  const tienePermiso = usuario.mecanico || (permitirAdmin && usuario.admin);

  if (!tienePermiso) {
    localStorage.setItem(
      "mensajeAccesoDenegado",
      "No tienes permisos para acceder a esta página"
    );
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RutasTrabajador;
