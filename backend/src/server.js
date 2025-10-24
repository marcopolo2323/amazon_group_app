const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on port ${PORT} on all interfaces`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Network: http://192.168.1.176:${PORT}`);
});
