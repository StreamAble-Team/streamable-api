// @ts-nocheck

import { app } from "../utils";
import { Server } from "socket.io";

import fs from "node:fs";
import path from "node:path";
import { CONFIG } from "../@types";

const pathToConfig = path.join(__dirname, "..", "..", "/config.json");

app.ready((err) => {
  if (err) throw err;

  app.log.info("Socket Server Started");

  fs.watchFile(pathToConfig, { interval: 1000 }, async (curr, prev) => {
    await fs.promises.readFile(pathToConfig, "utf8").then((data) => {
      const config: CONFIG = JSON.parse(data);
      const { maintenance_mode } = config;

      app.io.emit("maintenance_mode", maintenance_mode);
    });
  });

  app.io.on("connection", (socket) => {
    app.log.info("Socket connected!", socket.id);
  });
});

app.addHook("onClose", (instance, done) => {
  fs.unwatchFile(pathToConfig);
  done();
});

// declare module "fastify" {
//   interface FastifyInstance {
//     io: Server;
//   }
// }
