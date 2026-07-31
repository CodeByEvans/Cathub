import { Input } from "@/shared/components/atoms/input";

import React from "react";

import { useConnection } from "../contexts/ConnectionContext";

export const LinkModal: React.FC = () => {
  const { connectionRequestLink } = useConnection();

  if (!connectionRequestLink) return null;

  const shareLink = () => {
    navigator.share({
      title: "Nuestro enlace de Cathub",
      text: "Aquí está mi enlace de conexión:",
      url: connectionRequestLink,
    });
  };

  return (
    <div
      data-tauri-drag-region
      className="fixed inset-0 flex items-center justify-center backdrop-blur z-50 rounded-lg"
    >
      <div className="bg-white rounded-lg p-4 w-96 shadow-lg relative">
        <h2 className="text-xl font-semibold mb-2 text-foreground">
          ¡Este es tu enlace de conexión!
        </h2>
        <p className="mb-2">
          Para poder conectar con tu pareja necesitas compartirle este enlace:
        </p>

        {/* Cajoncito con el enlace y botón de copiar */}

        <div className="flex items-center mb-4">
          <Input
            value={connectionRequestLink}
            readOnly
            className="flex-1 mr-2"
          />
          <button
            onClick={() => shareLink()}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
          >
            Compartir
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkModal;
