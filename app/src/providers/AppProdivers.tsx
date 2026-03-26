import { CallProvider } from "@/modules/call/context/CallContext";

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <CallProvider>{children}</CallProvider>;
