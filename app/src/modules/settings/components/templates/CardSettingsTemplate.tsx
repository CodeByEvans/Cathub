import { CardLayout } from "../organisms/CardLayout";
import { OptionCard } from "../molecules/OptionCard";
import { OptionCardProps } from "../../@types/settings.types";

export interface CardSettingsTemplateProps<T> {
  cards: OptionCardProps<T>[];
  onAction: (action: T) => void;
  selectedValue: T;
}

export const CardSettingsTemplate = <T,>({
  cards,
  onAction,
  selectedValue,
}: CardSettingsTemplateProps<T>) => {
  return (
    <div className="h-full flex flex-col items-center ">
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
    </div>
  );
};
