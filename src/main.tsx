import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

document.documentElement.classList.add("portfolio-interactive");

createRoot(document.getElementById("root")!).render(<App />);
