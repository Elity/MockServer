const express = require("express");
const bodyParser = require("body-parser");
const log = require("./log");

let _server = null,
  app = null;

function start(rootPath, port) {
  app = express();
  app.use(express.static(rootPath));
  app.use(bodyParser.json({ limit: "5mb", strict: false }));
  app.use(bodyParser.urlencoded({ extended: true, limit: "5mb" }));
  return new Promise((resolve, reject) => {
    _server = app
      .listen(port, () => {
        log.info(`Mock Server started`);
        resolve(app);
      })
      .on("error", error => {
        log.err(`Failed to start Mock Server due to ${error.message}`);
        reject(error);
        _server = null;
      })
      .on("request", (req, res) => {
        log.info(`${req.method} ${req.originalUrl}`);
      });
    _server.addListener("connection", socket => {
      // 不设置socket连接超时的话无法停止服务
      socket.setTimeout(3e3);
    });
  });
}

function stop() {
  return new Promise((resolve, reject) => {
    if (!_server) {
      const err = "Mock Server not running";
      console.log(err);
      return reject({ message: err });
    }
    _server.close(() => {
      console.log(`Mock Server stopped`);
      _server = null;
      app = null;
      resolve();
    });
  });
}

module.exports = {
  start,
  stop
};
