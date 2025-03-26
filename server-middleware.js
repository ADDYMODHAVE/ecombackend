const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

function serverMiddleware(app) {
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());
}

module.exports = serverMiddleware;
