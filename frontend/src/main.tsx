import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import AuthGuard from "./modules/auth/components/AuthGuard";
import { Toaster } from "./components/ui/sonner";
import DeepLinkListener from "./modules/deep-link/DeepLinkListener";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <DeepLinkListener />
    <Toaster />
    <AuthGuard>
      <App />
    </AuthGuard>
  </React.StrictMode>,
);
