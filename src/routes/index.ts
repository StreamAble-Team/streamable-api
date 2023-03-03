import { FastifyInstance, RegisterOptions } from "fastify";

import list from "./list";
import anilist from "./anilist";
import anilistManga from "./anilist/manga";

import aniskip from "./aniskip";
import Providers from "./utils/providers";

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
  fastify.get("/", async (request, reply) => {
    return { message: "Hello World" };
  });

  await fastify.register(list, { prefix: "/list" });
  await fastify.register(anilist, { prefix: "/anilist" });
  await fastify.register(anilistManga, { prefix: "/anilist-manga" });
  await fastify.register(aniskip, { prefix: "/aniskip" });

  await fastify.register(new Providers().getProviders);
};

export default routes;
