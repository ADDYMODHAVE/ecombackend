const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

function serverMiddleware(app) {
  app.use(cors());
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
  app.use(cookieParser());
}

module.exports = serverMiddleware;
