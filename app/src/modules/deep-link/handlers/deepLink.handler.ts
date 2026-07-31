import { acceptConnectionRequest } from "../services/deepLinkBridge";

export const handleDeepLink = async (urlStr: string) => {
  const url = new URL(urlStr);

  if (url.host === "accept-connection") {
    const requestId = url.pathname.split("/")[1];

    if (requestId) {
      await acceptConnectionRequest(requestId);
      return true;
    }
  }

  return false;
};
