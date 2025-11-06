import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "inversify-react";
import "./index.css";
import App from "./App.tsx";
import { Container } from "inversify";

export function renderApp(container?: Container) {
  if (!container) {
    console.error("container is undefined");
    alert("container is undefined");
    return;
  }
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <Provider container={container}>
        <App />
      </Provider>
    </StrictMode>
  );
}
