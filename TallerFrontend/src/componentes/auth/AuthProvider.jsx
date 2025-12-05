import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const usuarioGuardado =
      localStorage.getItem("usuario") || sessionStorage.getItem("usuario");
    if (usuarioGuardado) {
      try {
        setUsuario(JSON.parse(usuarioGuardado));
      } catch {
        console.error("Error al leer usuario del almacenamiento");
      }
    }
    setCargando(false);
  }, []);

  const login = (usuarioData, recordar = false) => {
    setUsuario(usuarioData);
    const storage = recordar ? localStorage : sessionStorage;
    storage.setItem("usuario", JSON.stringify(usuarioData));
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem("usuario");
    sessionStorage.removeItem("usuario");
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
