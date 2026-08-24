import { cn } from "@/lib/utils";
import { PhoneCall } from "lucide-react";
import { Button } from "@/shared/components/atoms/button";
import { useCall } from "../../context/CallContext";

export const CallButton = ({ isOnline }: { isOnline: boolean }) => {
  const { calls } = useCall();
  return (
    <div className="flex flex-col items-center justify-center">
      <Button
        type="button"
        disabled={!isOnline}
        className={cn(
          "w-14 h-14 rounded-full p-0 shadow-lg transition-all duration-300 hover:scale-105 active:scale-95",
        )}
        style={{
          backgroundColor: "var(--primary)",
          color: "var(--primary-foreground)",
        }}
        onClick={() => calls.startCall(true)}
      >
        <PhoneCall className="w-6 h-6" />
      </Button>
    </div>
  );
};
