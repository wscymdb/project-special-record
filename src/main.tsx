import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { HashRouter } from "react-router";
import "normalize.css";

createRoot(document.getElementById("root")!).render(
  <HashRouter>
    <App />
  </HashRouter>
);
