import { Button } from "@/globals/components/atoms/button";
import { ArrowLeft } from "lucide-react";

export const BackButton: React.FC<{ onClickAction: () => void }> = ({
  onClickAction,
}) => (
  <Button
    variant="ghost"
    size="sm"
    className="
      absolute top-2 left-2 z-50
      flex items-center gap-1
    "
    onClick={onClickAction}
  >
    <ArrowLeft className="w-3 h-3" />
    Volver
  </Button>
);
