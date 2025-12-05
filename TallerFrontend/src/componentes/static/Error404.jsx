import { Link } from "react-router-dom";
import "../../styles/Error404.css";

function Error404() {
  return (
    <div className="error-hero">
      <div className="error-card">
        <div className="error-content">
          <h1>404</h1>
          <div className="error-divider"></div>
          <h2>Página no encontrada</h2>
          <p>La página que buscas no existe o ha sido movida.</p>
          <Link to="/" className="error-link">
            <span>Volver al inicio</span>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 12H19M19 12L12 5M19 12L12 19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Error404;
