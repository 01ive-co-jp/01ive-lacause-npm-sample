import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import GlobalErrorHandler from "./GlobalErrorHandler.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlobalErrorHandler />
    <App />
  </StrictMode>
);
