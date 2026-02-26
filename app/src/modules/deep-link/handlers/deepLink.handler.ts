// handlers/deepLink.handler.ts

import { connectionService } from "@/modules/connection/services/connection.service";

export const handleDeepLink = async (urlStr: string) => {
  const url = new URL(urlStr);

  if (url.host === "accept-connection") {
    const requestId = url.pathname.split("/")[1];

    if (requestId) {
      await connectionService.createConnection(requestId);
      return true;
    }
  }

  return false;
};
