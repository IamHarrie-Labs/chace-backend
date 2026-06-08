import React from "react";
import ReactDOM from "react-dom/client";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { ThemeProvider } from "./ThemeContext";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl="https://trychace.vercel.app/tonconnect-manifest.json">
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </TonConnectUIProvider>
  </React.StrictMode>
);
