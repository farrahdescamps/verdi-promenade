import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import 'leaflet/dist/leaflet.css';
import './styles/components.css';
import { App } from "./App";
import { LanguageProvider } from "./contexts/LanguageContext";
import { initViewportHeight, cleanupViewportHeight } from "./utils/viewport";

initViewportHeight();

window.addEventListener('beforeunload', cleanupViewportHeight);

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
);
