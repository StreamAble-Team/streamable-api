import fastify from "fastify";
import { log } from "./logger";

export const app = fastify({
  maxParamLength: 1000,
  logger: log,
});
