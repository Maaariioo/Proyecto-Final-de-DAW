import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";

const RutasAdmin = ({ children }) => {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return <div>Cargando autenticación...</div>;
  }

  if (!usuario) {
    return <Navigate to="/inicio-sesion" replace />;
  }

  if (!usuario.admin) {
    localStorage.setItem(
      "mensajeAccesoDenegado",
      "No tienes acceso a esta página"
    );
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RutasAdmin;
