import { useState } from "react";

export const useSettings = () => {
  const [showSettings, setShowSettings] = useState(false);
  const openSettings = () => setShowSettings(true);
  const closeSettings = () => setShowSettings(false);
  return { showSettings, openSettings, closeSettings };
};
