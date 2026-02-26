import { Input } from "@/globals/components/atoms/input";

import React, { useEffect } from "react";

import { toast } from "sonner";

import { load } from "@tauri-apps/plugin-store";
import { connectionService } from "../services/connection.service";

export const LinkModal: React.FC = () => {
  const [invitationLink, setInvitationLink] = React.useState("");

  useEffect(() => {
    const init = async () => {
      try {
        // Primero revisamos si ya tenemos un enlace generado en el store
        const store = await load("store.json");
        let link = await store.get<string>("connection_link_request_link");
        // Si no hay enlace en el store, intentamos obtener uno desde el backend o generarlo
        if (!link) {
          link =
            (await connectionService.getConnectionRequestLink()) ||
            (await connectionService.generateLink());
          // Si obtenemos un enlace, lo guardamos en el store para futuras referencias
          if (link) {
            await store.set("connection_link_request_link", link);
            await store.save();
            setInvitationLink(link);
          }
        } else {
          setInvitationLink(link);
        }
      } catch (error) {
        console.error(error);
        toast.error("Error al generar el enlace de conexión");
      }
    };
    init();
  }, []);

  const shareLink = (link: string) => {
    navigator.share({
      title: "Nuestro enlace de Cathub",
      text: "Aquí está mi enlace de conexión:",
      url: link,
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
          <Input value={invitationLink} readOnly className="flex-1 mr-2" />
          <button
            onClick={() => shareLink(invitationLink)}
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
