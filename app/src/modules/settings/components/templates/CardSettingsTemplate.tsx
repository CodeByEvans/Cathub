import { CardSettingsTemplateProps } from "../../@types/settings.types";
import { CardLayout } from "../organisms/CardLayout";
import { OptionCard } from "../molecules/OptionCard";

export const CardSettingsTemplate = <T,>({
  cards,
  onAction,
  selectedValue,
}: CardSettingsTemplateProps<T>) => {
  return (
    <CardLayout>
      {cards.map((card) => (
        <OptionCard<T>
          key={String(card.value)}
          icon={card.icon}
          title={card.title}
          description={card.description}
          value={card.value}
          isActive={selectedValue === card.value}
          onClick={(value) => onAction(value)}
        />
      ))}
    </CardLayout>
  );
};
