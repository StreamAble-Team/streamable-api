import { FastifyRequest } from "fastify";
import pino from "pino";

export const log = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },

  serializers: {
    req: function (req: FastifyRequest) {
      let ip: string =
        (req.headers["cf-connecting-ip"] as string) ??
        (req.headers["x-forwarded-for"] as string) ??
        req.ip;

      return {
        mathod: req.method,
        url: req.url,
        hostname: req.hostname,
        remoteAddress: ip,
        remotePort: req.socket.remotePort,
        query: req.query,
        params: req.params,
        origin: req.headers["origin"] ?? "",
      };
    },
  },
});
