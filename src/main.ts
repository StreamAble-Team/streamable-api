require("dotenv").config();

import { fastifySocketIO } from "./utils/sockets";
import FastifyCors from "@fastify/cors";

import bodyParser from "@fastify/formbody";

import routes from "./routes";
import { app } from "./utils";

import Console from "@tdanks2000/fancyconsolelog";
const PORT = Number(process.env.PORT) || 3000;

const console = new Console();

(async () => {
  app.register(fastifySocketIO);

  app.register(FastifyCors, {
    origin: "*",
  });
  app.register(bodyParser);

  app.register(routes, {
    prefix: "/api",
  });

  require("./sockets");

  app.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
  });
})();
