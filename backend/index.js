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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor en http://localhost:3000");
});
