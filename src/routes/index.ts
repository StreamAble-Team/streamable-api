import { FastifyInstance, RegisterOptions } from "fastify";

import list from "./list";
import anilist from "./anilist";

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
  fastify.get("/", async (request, reply) => {
    return { message: "Hello World" };
  });

  fastify.register(list, { prefix: "/list" });
  fastify.register(anilist, { prefix: "/anilist" });
};

export default routes;
