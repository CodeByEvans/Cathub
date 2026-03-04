import React, { useEffect, useState } from "react";
import { Mic, Volume2 } from "lucide-react";
import { CardLayout } from "../components/organisms/CardLayout";
import { OptionCard } from "../components/molecules/OptionCard";
import { callService } from "@/modules/call/services/call.service";

export const AudioSettingsView: React.FC = () => {
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [speakers, setSpeakers] = useState<MediaDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState<string>("");
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      const { microphones, speakers } = await callService.getAudioDevices();
      setMicrophones(microphones);
      setSpeakers(speakers);

      // Cargar selección guardada (si la tienes en store) o usar default
      const savedMic =
        localStorage.getItem("selectedMicId") ?? microphones[0]?.deviceId ?? "";
      const savedSpeaker =
        localStorage.getItem("selectedSpeakerId") ??
        speakers[0]?.deviceId ??
        "";
      setSelectedMic(savedMic);
      setSelectedSpeaker(savedSpeaker);
      callService.setAudioDevices(savedMic, savedSpeaker);
    };
    load();
  }, []);

  const handleMicChange = (deviceId: string) => {
    setSelectedMic(deviceId);
    localStorage.setItem("selectedMicId", deviceId);
    callService.setAudioDevices(deviceId, selectedSpeaker);
  };

  const handleSpeakerChange = (deviceId: string) => {
    setSelectedSpeaker(deviceId);
    localStorage.setItem("selectedSpeakerId", deviceId);
    callService.setAudioDevices(selectedMic, deviceId);
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto gap-2 px-2 pt-8">
      {/* Micrófonos */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 px-4 pt-3">
          <Mic className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Micrófono
          </span>
        </div>
        <CardLayout>
          {microphones.map((mic) => (
            <OptionCard<string>
              key={mic.deviceId}
              icon={<Mic className="w-5 h-5" />}
              title={mic.label || `Micrófono ${mic.deviceId.slice(0, 6)}`}
              value={mic.deviceId}
              isActive={selectedMic === mic.deviceId}
              onClick={handleMicChange}
            />
          ))}
        </CardLayout>
      </div>

      {/* Altavoces */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 px-4">
          <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Altavoz
          </span>
        </div>
        <CardLayout>
          {speakers.map((speaker) => (
            <OptionCard<string>
              key={speaker.deviceId}
              icon={<Volume2 className="w-5 h-5" />}
              title={speaker.label || `Altavoz ${speaker.deviceId.slice(0, 6)}`}
              value={speaker.deviceId}
              isActive={selectedSpeaker === speaker.deviceId}
              onClick={handleSpeakerChange}
            />
          ))}
        </CardLayout>
      </div>
    </div>
  );
};
