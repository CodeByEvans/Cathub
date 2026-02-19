export const handleDeepLink = async (urlStr) => {
  const url = new URL(urlStr);

  if (url.host === "accept-connection") {
    const requestId = url.pathname.split("/")[1];

    if (requestId) {
      console.log("Conexión creada exitosamente");
      console.log("requestId:", requestId);
      return true;
    }
  }

  return false;
};

// mock rápido para ver que se ejecuta
const fakeUrl =
  "cathub://accept-connection/a1348372-6d7d-47a5-9a2d-a79c692926ef";

handleDeepLink(fakeUrl)
  .then((result) => {
    console.log("Resultado:", result);
  })
  .catch(console.error);
