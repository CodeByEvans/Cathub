const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Aquí está el backend de Cathub :)");
});

app.get("/api/accept-connection/:request_id", (req, res) => {
  const requestId = req.params.request_id;

  const deepLink = `cathub://accept-connection/${requestId}`;

  res.redirect(deepLink);
});

app.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});
