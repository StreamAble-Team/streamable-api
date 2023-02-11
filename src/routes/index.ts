import { FastifyInstance, RegisterOptions } from "fastify";

import list from "./list";
import anilist from "./anilist";
import anilistManga from "./anilist/manga";

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
  fastify.get("/", async (request, reply) => {
    return { message: "Hello World" };
  });

  fastify.register(list, { prefix: "/list" });
  fastify.register(anilist, { prefix: "/anilist" });
  fastify.register(anilistManga, { prefix: "/anilist-manga" });
};

export default routes;
