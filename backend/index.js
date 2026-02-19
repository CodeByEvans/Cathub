const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Aquí está el backend de Cathub :)");
});

app.get("/accept-connection/:request_id", (req, res) => {
  const requestId = req.params.request_id;

  const deepLink = `cathub://accept-connection/${requestId}`;

  res.redirect(deepLink);
});

module.exports = app;

if (require.main === module) {
  app.listen(3000, () => {
    console.log("🚀 Server started on http://localhost:3000");
  });
}
