import { BackButton } from "../components/molecules/BackButton";

interface ProfileSettingsProps {
  setCurrentView: (section: "main" | "edit-profile") => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsProps> = ({
  setCurrentView,
}) => {
  return (
    <div className="h-full flex flex-col items-center justify-start p-4 gap-4">
      <BackButton onClickAction={() => setCurrentView("main")} />
    </div>
  );
};
