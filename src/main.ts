require("dotenv").config();

import Fastify from "fastify";
import FastifyCors from "@fastify/cors";

import bodyParser from "@fastify/formbody";

import routes from "./routes";

const PORT = Number(process.env.PORT) || 3000;

(async () => {
  const app = Fastify({
    maxParamLength: 1000,
    logger: true,
  });

  app.register(FastifyCors, {
    origin: "*",
  });
  app.register(bodyParser);

  app.register(routes, {
    prefix: "/api",
  });

  app.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
    console.log(`🚀 server listening on ${address}`);
  });
})();
