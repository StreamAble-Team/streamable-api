import { FastifyInstance, RegisterOptions } from "fastify";
import { IAnimeResult, IMediaResult, WatchingStatus } from "../models/types";

import { utils } from "../utils";

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
  fastify.get("/", async (request, reply) => {
    return { message: "Hello World" };
  });

  fastify.post("/:status", async (request, reply) => {
    const { status } = request.params as any;
    const body = request.body as any;

    if (!body) {
      reply.code(400);
      return { message: "Bad Request: no body" };
    }

    const watchingStatus = Object.values(WatchingStatus);

    if (!watchingStatus.includes(status.toUpperCase())) {
      reply.code(400);
      return {
        message: `Bad Request: Status must be one of the following: ${watchingStatus
          .map((status) => status.toUpperCase())
          .join(", ")}`,
      };
    }

    const formatData: IMediaResult = utils.formatData(body);

    try {
      // add data to prisma database or update if already exists
      await utils.addToDatabase(formatData);
      reply.code(200);
      return { message: "OK" };
    } catch (error) {
      reply.code(500);
      return { message: "Internal Server Error" };
    }
  });
};

export default routes;
