import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./types/global.d.ts";

// Remove Preload scripts loading
postMessage({ payload: "removeLoading" }, "*");

// Use contextBridge
const ipcRenderer = window.ipcRenderer;

// Listen for messages from the main process
ipcRenderer.on("main-process-message", (_event: any, message: any) => {
  console.log("Message from main process:", message);
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
