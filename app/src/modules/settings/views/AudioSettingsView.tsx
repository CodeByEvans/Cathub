import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mic, Volume2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getValue } from "@/services/store.service";
import { useCall } from "@/modules/call/context/CallContext";
import { audioService } from "@/services/audio.service";

type DeviceTab = "mic" | "speaker";

export const AudioSettingsView: React.FC = () => {
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [speakers, setSpeakers] = useState<MediaDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState<string>("");
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>("");
  const [activeTab, setActiveTab] = useState<DeviceTab>("mic");

  const { devices } = useCall();

  useEffect(() => {
    const load = async () => {
      const { microphones, speakers } = await devices.getDevices();
      setMicrophones(microphones);
      setSpeakers(speakers);

      const savedMic = await getValue("selectedMicId");
      const savedSpeaker = await getValue("selectedSpeakerId");

      if (savedMic) {
        setSelectedMic(savedMic);
      } else if (microphones.length > 0) {
        setSelectedMic(microphones[0].deviceId);
      }

      if (savedSpeaker) {
        setSelectedSpeaker(savedSpeaker);
      } else if (speakers.length > 0) {
        setSelectedSpeaker(speakers[0].deviceId);
      }

      if (savedMic && savedSpeaker) {
        devices.setDevices(savedMic, savedSpeaker);
      }
    };
    load();
  }, []);

  const handleDeviceSelect = (deviceId: string) => {
    const play = (key: string) => audioService.play(key as never, { volume: 0.1 });
    play("click");

    if (activeTab === "mic") {
      setSelectedMic(deviceId);
      devices.setDevices(deviceId, selectedSpeaker);
    } else {
      setSelectedSpeaker(deviceId);
      devices.setDevices(selectedMic, deviceId);
    }
  };

  const currentDevices = activeTab === "mic" ? microphones : speakers;
  const currentSelected = activeTab === "mic" ? selectedMic : selectedSpeaker;
  const DeviceIcon = activeTab === "mic" ? Mic : Volume2;

  return (
    <motion.div
      className="h-full flex flex-col px-4 pt-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-1 mb-2">
        <button
          onClick={() => setActiveTab("mic")}
          className={cn(
            "flex-1 h-7 rounded-lg flex items-center justify-center gap-1.5 text-[11px] font-medium transition-all duration-200",
            activeTab === "mic"
              ? "bg-primary/15 text-primary border border-primary/30 shadow-[0_0_8px_rgba(var(--primary-rgb),0.1)]"
              : "bg-white/5 dark:bg-white/[0.03] text-muted-foreground border border-border/30 hover:border-primary/20 hover:text-foreground",
          )}
        >
          <Mic className="w-3 h-3" />
          Micrófono
        </button>
        <button
          onClick={() => setActiveTab("speaker")}
          className={cn(
            "flex-1 h-7 rounded-lg flex items-center justify-center gap-1.5 text-[11px] font-medium transition-all duration-200",
            activeTab === "speaker"
              ? "bg-primary/15 text-primary border border-primary/30 shadow-[0_0_8px_rgba(var(--primary-rgb),0.1)]"
              : "bg-white/5 dark:bg-white/[0.03] text-muted-foreground border border-border/30 hover:border-primary/20 hover:text-foreground",
          )}
        >
          <Volume2 className="w-3 h-3" />
          Altavoz
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {currentDevices.map((device, i) => (
          <motion.button
            key={device.deviceId}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 24 }}
            onClick={() => handleDeviceSelect(device.deviceId)}
            className={cn(
              "w-full h-9 rounded-lg flex items-center gap-2 px-3 transition-all duration-200",
              currentSelected === device.deviceId
                ? "bg-primary/15 border border-primary/40 shadow-[0_0_8px_rgba(var(--primary-rgb),0.1)]"
                : "bg-white/5 dark:bg-white/[0.03] border border-border/30 hover:bg-primary/5 hover:border-primary/20",
            )}
          >
            <DeviceIcon
              className={cn(
                "w-3.5 h-3.5 flex-shrink-0",
                currentSelected === device.deviceId
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            />
            <span
              className={cn(
                "text-[11px] truncate flex-1 text-left",
                currentSelected === device.deviceId
                  ? "text-foreground font-medium"
                  : "text-muted-foreground",
              )}
            >
              {device.label || `Dispositivo ${device.deviceId.slice(0, 6)}`}
            </span>
            {currentSelected === device.deviceId && (
              <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            )}
          </motion.button>
        ))}

        {currentDevices.length === 0 && (
          <div className="flex items-center justify-center h-16 text-[10px] text-muted-foreground">
            No se encontraron dispositivos
          </div>
        )}
      </div>
    </motion.div>
  );
};
