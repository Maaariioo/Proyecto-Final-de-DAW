import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";

const RutasProtegidas = ({ children }) => {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return <div>Cargando autenticación...</div>;
  }

  if (!usuario) {
    return <Navigate to="/inicio-sesion" replace />;
  }

  return children;
};

export default RutasProtegidas;
