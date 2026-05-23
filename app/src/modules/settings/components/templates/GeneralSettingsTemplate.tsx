import { SettingsButton } from "../molecules/SettingsButton";
import { SettingsButtonProps } from "../../@types/settings.types";
import { ButtonLayout } from "../organisms/ButtonLayout";

export interface SettingsTemplateProps {
  buttons: SettingsButtonProps[];
  onAction: (action: string) => void;
}

export const GeneralSettingsTemplate: React.FC<SettingsTemplateProps> = ({
  buttons,
  onAction,
}) => {
  return (
    <ButtonLayout>
      {buttons.map((button, i) => (
        <SettingsButton
          key={button.action}
          {...button}
          index={i}
          onClickAction={() => onAction(button.action)}
        />
      ))}
    </ButtonLayout>
  );
};
