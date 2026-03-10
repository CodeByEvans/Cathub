import { cn } from "@/lib/utils";
import { Phone } from "lucide-react";
import { Button } from "@/globals/components/atoms/button";
import { peerService } from "../../../../services/peer.service";

export const CallButton = ({ isOnline }: { isOnline: boolean }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <Button
        type="button"
        disabled={!isOnline}
        className={cn(
          "w-14 h-14 rounded-full p-0 shadow-lg transition-all duration-300 hover:scale-105 active:scale-95",
        )}
        style={{
          backgroundColor: "var(--call-button)",
          color: "var(--call-button-foreground)",
        }}
        onClick={() => peerService.startCall(true)}
      >
        <Phone className="w-6 h-6" />
      </Button>
    </div>
  );
};
