const env = require("./config/env");
const app = require("./app");

app.listen(env.port, () => {
  console.log(`API de administracion en http://localhost:${env.port}`);
});
