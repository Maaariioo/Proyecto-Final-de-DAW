import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/index.css";
/* Componentes comunes */
import Header from "./componentes/common/Header.jsx";
import Footer from "./componentes/common/Footer.jsx";
/* Páginas generales */
import Inicio from "./componentes/static/Inicio.jsx";
import SobreNosotros from "./componentes/static/SobreNosotros.jsx";
import Error404 from "./componentes/static/Error404.jsx";
/* Autenticación */
import AuthProvider from "./componentes/auth/AuthProvider.jsx";
import IniciarSesion from "./componentes/auth/IniciarSesion.jsx";
import Registro from "./componentes/auth/Registro.jsx";
/* Servicios */
import Servicios from "./componentes/servicios/Servicios.jsx";
import AdministrarServicios from "./componentes/servicios/AdministrarServicios.jsx";
/* Citas */
import FormularioCita from "./componentes/citas/PedirCita.jsx";
import AdministrarCitas from "./componentes/citas/AdministrarCitas.jsx";
/* Trabajadores */
import AdministrarTrabajadores from "./componentes/trabajadores/AdministrarTrabajadores.jsx";
/* Vehículos */
import AdministrarVehiculos from "./componentes/vehiculos/AdministrarVehiculos.jsx";
/* Planner */
import Planner from "./componentes/planner/Planner.jsx";
import PlannerLog from "./componentes/planner/PlannerLog.jsx";
/* Rutas protegidas */
import RutasProtegidas from "./componentes/rutas/RutasProtegidas.jsx";
import RutasAdmin from "./componentes/rutas/RutasAdmin.jsx";
import RutasTrabajador from "./componentes/rutas/RutasTrabajador.jsx";
/* PayPal Provider */
import { PayPalProvider } from "./componentes/paypal/PayPalProvider.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PayPalProvider>
          <Header />
          <Routes>
            {/* Públicas */}
            <Route path="/" element={<Inicio />} />
            <Route path="/sobre-nosotros" element={<SobreNosotros />} />
            <Route path="/servicios" element={<Servicios />} />
            <Route path="/inicio-sesion" element={<IniciarSesion />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="*" element={<Error404 />} />
            {/* Rutas protegidas */}
            <Route path="/pedir-cita" element={
                <RutasProtegidas>
                  <FormularioCita />
                </RutasProtegidas>
              }/>
            {/* Rutas trabajador / admin */}
            <Route path="/planner"element={
                <RutasTrabajador permitirAdmin={true}>
                  <Planner />
                </RutasTrabajador>
              }/>
            {/* Rutas admin */}
            <Route path="/administrar-servicios" element={
                <RutasAdmin>
                  <AdministrarServicios />
                </RutasAdmin>
              }/>
            <Route path="/administrar-citas" element={
                <RutasAdmin>
                  <AdministrarCitas />
                </RutasAdmin>
              }/>
            <Route path="/administrar-trabajadores" element={
                <RutasAdmin>
                  <AdministrarTrabajadores />
                </RutasAdmin>
              }/>
            <Route path="/administrar-vehiculos"element={
                <RutasAdmin>
                  <AdministrarVehiculos />
                </RutasAdmin>
              }/>
            <Route path="/planner-log" element={
                <RutasAdmin>
                  <PlannerLog />
                </RutasAdmin>
              }/>
          </Routes>
          <Footer />
        </PayPalProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
