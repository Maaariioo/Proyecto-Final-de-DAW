import { createContext, useContext, useEffect, useState } from "react";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const PayPalContext = createContext();

export const usePayPal = () => {
  const context = useContext(PayPalContext);
  if (!context) {
    throw new Error("usePayPal debe ser usado dentro de PayPalProvider");
  }
  return context;
};

export const PayPalProvider = ({ children }) => {
  const [paypalReady, setPaypalReady] = useState(false);

  const initialOptions = {
    clientId:
      "AWxXnGy6hc6IhnzOnr07jiQ6X098Z4X4ni2b0ELC7pZf3y_8AgcyN82DzlkAd_aiMq2Ge7SKlYd5W7UN",
    currency: "EUR",
    intent: "capture",
    components: "buttons",
  };

  useEffect(() => {
    // PayPal SDK se cargará automáticamente
    setPaypalReady(true);
    console.log("PayPal SDK preparado");
  }, []);

  return (
    <PayPalContext.Provider value={{ paypalReady }}>
      <PayPalScriptProvider options={initialOptions}>
        {children}
      </PayPalScriptProvider>
    </PayPalContext.Provider>
  );
};
