import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RegisterOptions,
} from "fastify";
import { cache } from "../../utils";
import { META, PROVIDERS_LIST, StreamingServers } from "@consumet/extensions";

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
  fastify.get("/", async (request, reply) => {
    return { hello: "world" };
  });

  fastify.get(
    "/search/:query",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { query } = request.params as { query: string };
      const { page = 1, perPage } = request.query as {
        page: number;
        perPage: number;
      };

      if (!query)
        return reply.code(400).send({ error: "Query parameter is required" });

      const anilist = new META.Anilist();

      try {
        let data = await cache.fetch(
          `anilist:search:${query}:page:${page}`,
          async () => await anilist.search(query),
          60 * 60 * 24
        );

        if (data && perPage) data = data.slice(0, perPage);

        const res = data ? data : await anilist.search(query, page, perPage);

        return reply.code(200).send(res);
      } catch (err) {
        return reply.code(500).send({ error: (err as Error).message });
      }
    }
  );

  fastify.get(
    "/info/:id",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      let {
        provider,
        dub: isDub,
        fetchFiller,
      } = request.query as {
        provider: string;
        dub: string | boolean;
        fetchFiller: string | boolean;
      };

      const now = new Date();
      const today = now.getDay();

      if (!id)
        return reply.code(400).send({ error: "ID parameter is required" });

      let anilist = new META.Anilist();

      if (typeof provider === "string") {
        const possibleProvider = PROVIDERS_LIST.ANIME.find(
          (p) => p.name.toLowerCase() === provider.toLocaleLowerCase()
        );

        anilist = new META.Anilist(possibleProvider);
      }

      if (isDub === "true" || isDub === "1") isDub = true;
      else isDub = false;

      if (fetchFiller === "true" || fetchFiller === "1") fetchFiller = true;
      else fetchFiller = false;

      try {
        const data = await cache.fetch(
          `anilist:info;${id};${isDub};${fetchFiller};${anilist.provider.name.toLowerCase()}`,
          async () =>
            await anilist.fetchAnimeInfo(
              id,
              isDub as boolean,
              fetchFiller as boolean
            ),
          today === 0 || today === 6 ? 60 * 120 : (60 * 60) / 2
        );

        return reply.code(200).send(data);
      } catch (err) {
        return reply.code(500).send({ error: (err as Error).message });
      }
    }
  );

  fastify.get(
    "/watch/:episodeId",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { episodeId } = request.params as { episodeId: string };
      const { provider, server } = request.query as {
        provider: string;
        server: StreamingServers;
      };

      if (!episodeId) return reply.code(400).send({ error: "ID is required" });

      if (server && !Object.values(StreamingServers).includes(server))
        return reply.code(400).send({ error: "Invalid server" });

      let anilist = new META.Anilist();

      if (typeof provider !== "undefined") {
        const possibleProvider = PROVIDERS_LIST.ANIME.find(
          (p) => p.name.toLowerCase() === provider.toLocaleLowerCase()
        );

        anilist = new META.Anilist(
          possibleProvider,
          typeof process.env.PROXIES !== "undefined"
            ? {
                url: JSON.parse(process.env.PROXIES!)[
                  Math.random() * JSON.parse(process.env.PROXIES!).length
                ],
              }
            : undefined
        );
      }

      try {
        const data = await cache.fetch(
          `anilist:watch;${episodeId};${anilist.provider.name.toLowerCase()};${server}`,
          async () => anilist.fetchEpisodeSources(episodeId, server),
          600
        );

        if (!data)
          return reply
            .code(200)
            .send(await anilist.fetchEpisodeSources(episodeId, server));

        return reply.code(200).send(data);
      } catch (err) {
        return reply.code(500).send({ error: (err as Error).message });
      }
    }
  );

  fastify.get(
    "/popular",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { page = 1, perPage } = request.query as {
        page: number;
        perPage: number;
      };

      let anilist = new META.Anilist();

      try {
        let data = await cache.fetch(
          `anilist:popular:page:${page}`,
          async () => await anilist.fetchPopularAnime(page),
          60 * 60 * 24
        );

        if (data && perPage) data = data.slice(0, perPage);

        const res = data
          ? data
          : await anilist.fetchPopularAnime(page, perPage);

        return reply.code(200).send(res);
      } catch (err) {
        return reply.code(500).send({ error: (err as Error).message });
      }
    }
  );

  fastify.get(
    "/trending",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { page = 1, perPage } = request.query as {
        page: number;
        perPage: number;
      };

      let anilist = new META.Anilist();

      try {
        let data = await cache.fetch(
          `anilist:trending:page:${page}`,
          async () => await anilist.fetchTrendingAnime(page),
          60 * 60 * 24
        );

        if (data && perPage) data = data.slice(0, perPage);

        const res = data
          ? data
          : await anilist.fetchTrendingAnime(page, perPage);

        return reply.code(200).send(res);
      } catch (err) {
        return reply.code(500).send({ error: (err as Error).message });
      }
    }
  );

  fastify.get(
    "/top-rated",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { page = 1, perPage } = request.query as {
        page: number;
        perPage: number;
      };

      let anilist = new META.Anilist();

      try {
        let data = await cache.fetch(
          `anilist:top-rated:page:${page}`,
          async () =>
            await anilist.advancedSearch(
              undefined,
              "ANIME",
              page,
              perPage,
              "TV",
              ["SCORE_DESC"]
            ),
          60 * 60 * 24
        );

        if (data && perPage) data = data.slice(0, perPage);

        const res = data
          ? data
          : await anilist.advancedSearch(
              undefined,
              "ANIME",
              page,
              perPage,
              "TV",
              ["SCORE_DESC"]
            );

        return reply.code(200).send(res);
      } catch (err) {
        return reply.code(500).send({ error: (err as Error).message });
      }
    }
  );

  fastify.get(
    "/upcoming",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { page = 1, perPage } = request.query as {
        page: number;
        perPage: number;
      };

      let anilist = new META.Anilist();

      try {
        let data = await cache.fetch(
          `anilist:upcoming:page:${page}`,
          async () =>
            await anilist.advancedSearch(
              undefined,
              "ANIME",
              page,
              perPage,
              "TV",
              ["START_DATE_DESC"]
            ),
          60 * 60 * 24
        );

        if (data && perPage) data = data.slice(0, perPage);

        const res = data
          ? data
          : await anilist.advancedSearch(
              undefined,
              "ANIME",
              page,
              perPage,
              "TV",
              ["START_DATE_DESC"]
            );

        return reply.code(200).send(res);
      } catch (err) {
        return reply.code(500).send({ error: (err as Error).message });
      }
    }
  );
};

export default routes;
