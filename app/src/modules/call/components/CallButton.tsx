import { cn } from "@/lib/utils";
import { Phone, PhoneOff } from "lucide-react";
import { Button } from "@/globals/components/atoms/button";
import { callService } from "../services/call.service";

export const CallButton = ({
  inCall,
  isOnline,
}: {
  inCall: boolean;
  isOnline: boolean;
}) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <Button
        type="button"
        disabled={!isOnline}
        className={cn(
          "w-14 h-14 rounded-full p-0 shadow-lg transition-all duration-300 hover:scale-105 active:scale-95",
        )}
        style={{
          backgroundColor: inCall ? "var(--hangup)" : "var(--call-button)",
          color: inCall
            ? "var(--hangup-foreground)"
            : "var(--call-button-foreground)",
        }}
        onClick={() =>
          inCall ? callService.endCall() : callService.startCall(true)
        }
      >
        {inCall ? (
          <PhoneOff className="w-6 h-6" />
        ) : (
          <Phone className="w-6 h-6" />
        )}
      </Button>
    </div>
  );
};
