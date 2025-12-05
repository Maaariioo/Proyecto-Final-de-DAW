import { useNavigate } from "react-router-dom";
import "../../styles/AdminLinks.css";

function AdminLinks({ onClose }) {
  const navigate = useNavigate();

  const irAlSitio = (ruta) => {
    navigate(ruta);
    onClose();
  };

  return (
    <div className="admin-links-content">
      <h3 className="admin-links-title">Panel de Administración</h3>
      <div className="admin-links-container">
        <button
          className="btn-admin-principal"
          onClick={() => irAlSitio("/administrar-citas")}
        >
          Administrar Citas
        </button>
        <button
          className="btn-admin-secundario"
          onClick={() => irAlSitio("/administrar-servicios")}
        >
          Administrar Servicios
        </button>

        <button
          className="btn-admin-secundario"
          onClick={() => irAlSitio("/administrar-trabajadores")}
        >
          Administrar Trabajadores
        </button>

        <button
          className="btn-admin-secundario"
          onClick={() => irAlSitio("/administrar-vehiculos")}
        >
          Administrar Vehículos
        </button>
      </div>
    </div>
  );
}

export default AdminLinks;
