import { FastifyRequest, FastifyReply, FastifyInstance, RegisterOptions } from "fastify";
import { META } from "@consumet/extensions";
import { PROVIDERS_LIST } from "@consumet/extensions";

import { cache } from "../../../utils";

const routes = async (fastify: FastifyInstance, opts: RegisterOptions) => {
  let anilist = new META.Anilist.Manga();

  fastify.get("/search/:query", async (request: FastifyRequest, reply: FastifyReply) => {
    let { query } = request.params as { query: string };
    let { page = 1 } = request.query as { page: number };

    if (!query) return reply.code(400).send({ error: "Query parameter is required" });

    try {
      let data = await cache.fetch(
        `anilist:manga:search:${query}:page:${page}`,
        async () => await anilist.search(query, page),
        60 * 60 * 24
      );

      let res = data ? data : await anilist.search(query, page);

      return reply.code(200).send(res);
    } catch (err) {
      reply.status(500).send({ error: err });
    }
  });

  fastify.get("/info/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    let { provider } = request.query as {
      provider: string;
    };
    const now = new Date();
    const today = now.getDay();

    if (!id) return reply.code(400).send({ error: "ID parameter is required" });

    if (typeof provider !== "undefined") {
      const possibleProvider = PROVIDERS_LIST.MANGA.find(
        (p) => p.name.toLowerCase() === provider.toLocaleLowerCase()
      );
      anilist = new META.Anilist.Manga(possibleProvider);
    }

    try {
      let data = await cache.fetch(
        `anilist:manga:info;${id};${anilist.provider.name.toLowerCase()}`,
        async () => await anilist.fetchMangaInfo(id),
        today === 0 || today === 6 ? 60 * 120 : (60 * 60) / 2
      );

      let res = data ? data : await anilist.fetchMangaInfo(id);

      reply.code(200).send(res);
      anilist = new META.Anilist.Manga();
    } catch (err) {
      reply.status(500).send({ error: err });
    }
  });

  fastify.get("/read", async (request: FastifyRequest, reply: FastifyReply) => {
    const { chapterId, provider } = request.query as {
      chapterId: string;
      provider: string;
    };

    if (!chapterId) return reply.code(400).send({ error: "Chapter ID is required" });

    if (typeof provider !== "undefined") {
      const possibleProvider = PROVIDERS_LIST.MANGA.find(
        (p) => p.name.toLowerCase() === provider.toLocaleLowerCase()
      );
      anilist = new META.Anilist.Manga(possibleProvider);
    }

    try {
      let data = await cache.fetch(
        `anilist:manga:read;${chapterId};${anilist.provider.name.toLowerCase()}`,
        async () => await anilist.fetchChapterPages(chapterId),
        600
      );

      let res = data ? data : await anilist.fetchChapterPages(chapterId);

      reply.code(200).send(res);
      anilist = new META.Anilist.Manga();
    } catch (err) {
      reply.status(500).send({ error: err });
    }
  });
};

export default routes;
