import { useConnection } from "@/modules/connection/contexts/ConnectionContext";

export const handleDeepLink = async (urlStr: string) => {
  const { createConnection } = useConnection();

  const url = new URL(urlStr);

  if (url.host === "accept-connection") {
    const requestId = url.pathname.split("/")[1];

    if (requestId) {
      await createConnection(requestId);
      return true;
    }
  }

  return false;
};
