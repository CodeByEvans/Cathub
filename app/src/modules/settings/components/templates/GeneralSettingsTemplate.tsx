import { SettingsButton } from "../molecules/SettingsButton";
import { SettingsTemplateProps } from "../../@types/settings.types";
import { ButtonLayout } from "../organisms/ButtonLayout";

export const GeneralSettingsTemplate: React.FC<SettingsTemplateProps> = ({
  buttons,
  onAction,
}) => {
  return (
    <ButtonLayout>
      {buttons.map((button) => (
        <SettingsButton
          key={button.action}
          {...button}
          onClickAction={() => onAction(button.action)}
        />
      ))}
    </ButtonLayout>
  );
};
