import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./app/App.jsx";
import { AuthProvider } from "./features/auth/hooks/useAuth.jsx";
import { applyUiPreferences } from "./shared/utils/uiPreferences.js";

applyUiPreferences();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
