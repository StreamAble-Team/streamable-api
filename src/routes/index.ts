import { FastifyInstance, RegisterOptions } from "fastify";

import list from "./list";
import { anilist, anilistManga, aniskip } from "./info";
import { ann } from "./news";

import Providers from "./utils/providers";

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
  fastify.get("/", async (request, reply) => {
    return { message: "Hello World" };
  });

  /**
   * INFO
   */
  await fastify.register(anilist, { prefix: "/anilist" });
  await fastify.register(anilistManga, { prefix: "/anilist-manga" });
  await fastify.register(aniskip, { prefix: "/aniskip" });

  /**
   * NEWS
   */
  await fastify.register(ann, { prefix: "/ann" });

  /**
   * UTILS
   */
  await fastify.register(new Providers().getProviders);
};

export default routes;
