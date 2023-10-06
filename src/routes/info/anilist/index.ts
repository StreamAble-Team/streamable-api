import { FastifyInstance, FastifyReply, FastifyRequest, RegisterOptions } from "fastify";
import { cache } from "../../../utils";
import { ANIME, Genres, META, PROVIDERS_LIST, StreamingServers } from "@consumet/extensions";
import NineAnime from "@consumet/extensions/dist/providers/anime/9anime";
import Anilist from "@consumet/extensions/dist/providers/meta/anilist";

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
  fastify.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    return { hello: "world" };
  });

  fastify.get("/search/:query", async (request: FastifyRequest, reply: FastifyReply) => {
    const { query } = request.params as { query: string };
    const { page = 1, perPage } = request.query as {
      page: number;
      perPage: number;
    };

    if (!query) return reply.code(400).send({ error: "Query parameter is required" });

    const anilist = new META.Anilist();

    try {
      let data = await cache.fetch(
        `anilist:search:${query}:page:${page}`,
        async () => await anilist.search(query),
        60 * 60 * 24
      );

      const res = data ? data : await anilist.search(query, page, perPage);

      return reply.code(200).send(res);
    } catch (err) {
      return reply.code(500).send({ error: (err as Error).message });
    }
  });

  fastify.get("/info/:id", async (request: FastifyRequest, reply: FastifyReply) => {
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

    if (!id) return reply.code(400).send({ error: "ID parameter is required" });

    let anilist = generateAnilistMeta(provider);

    if (isDub === "true" || isDub === "1") isDub = true;
    else isDub = false;

    if (fetchFiller === "true" || fetchFiller === "1") fetchFiller = true;
    else fetchFiller = false;

    try {
      let data = await cache.fetch(
        `anilist:info;${id};${isDub};${fetchFiller};${anilist.provider.name.toLowerCase()}`,
        async () => await anilist.fetchAnimeInfo(id, isDub as boolean, fetchFiller as boolean),
        today === 0 || today === 6 ? 60 * 120 : (60 * 60) / 2
      );

      data = data ? data : await anilist.fetchAnimeInfo(id, isDub, fetchFiller);

      return reply.code(200).send(data);
    } catch (err) {
      console.log({ err });
      return reply.code(500).send({ error: (err as Error).message });
    }
  });

  fastify.get("/watch/:episodeId", async (request: FastifyRequest, reply: FastifyReply) => {
    const { episodeId } = request.params as { episodeId: string };
    const { provider, server } = request.query as {
      provider: string;
      server: StreamingServers;
    };

    if (!episodeId) return reply.code(400).send({ error: "ID is required" });

    if (server && !Object.values(StreamingServers).includes(server))
      return reply.code(400).send({ error: "Invalid server" });

    let anilist = generateAnilistMeta(provider);

    try {
      const data = await cache.fetch(
        `anilist:watch;${episodeId};${anilist.provider.name.toLowerCase()};${server}`,
        async () => anilist.fetchEpisodeSources(episodeId, server),
        600
      );

      if (!data) return reply.code(200).send(await anilist.fetchEpisodeSources(episodeId, server));

      return reply.code(200).send(data);
    } catch (err) {
      console.log(err);
      return reply.code(500).send({ error: (err as Error).message });
    }
  });

  fastify.get("/popular", async (request: FastifyRequest, reply: FastifyReply) => {
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

      const res = data ? data : await anilist.fetchPopularAnime(page, perPage);

      return reply.code(200).send(res);
    } catch (err) {
      return reply.code(500).send({ error: (err as Error).message });
    }
  });

  fastify.get("/trending", async (request: FastifyRequest, reply: FastifyReply) => {
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

      const res = data ? data : await anilist.fetchTrendingAnime(page, perPage);

      return reply.code(200).send(res);
    } catch (err) {
      return reply.code(500).send({ error: (err as Error).message });
    }
  });

  fastify.get("/top-rated", async (request: FastifyRequest, reply: FastifyReply) => {
    const { page = 1, perPage } = request.query as {
      page: number;
      perPage: number;
    };

    let anilist = new META.Anilist();

    try {
      let data = await cache.fetch(
        `anilist:top-rated:page:${page}`,
        async () =>
          await anilist.advancedSearch(undefined, "ANIME", page, perPage, "TV", ["SCORE_DESC"]),
        60 * 60 * 24
      );

      const res = data
        ? data
        : await anilist.advancedSearch(undefined, "ANIME", page, perPage, "TV", ["SCORE_DESC"]);

      return reply.code(200).send(res);
    } catch (err) {
      return reply.code(500).send({ error: (err as Error).message });
    }
  });

  fastify.get("/upcoming", async (request: FastifyRequest, reply: FastifyReply) => {
    const { page = 1, perPage } = request.query as {
      page: number;
      perPage: number;
    };

    let anilist = new META.Anilist();

    try {
      let data = await cache.fetch(
        `anilist:upcoming:page:${page}`,
        async () =>
          await anilist.advancedSearch(undefined, "ANIME", page, perPage, "TV", [
            "START_DATE_DESC",
          ]),
        60 * 60 * 24
      );

      const res = data
        ? data
        : await anilist.advancedSearch(undefined, "ANIME", page, perPage, "TV", [
            "START_DATE_DESC",
          ]);

      return reply.code(200).send(res);
    } catch (err) {
      return reply.code(500).send({ error: (err as Error).message });
    }
  });

  fastify.get("/advanced-search", async (request: FastifyRequest, reply: FastifyReply) => {
    let { query, page, perPage, type, genres, id, format, sort, status, year, season } =
      request.query as {
        query: string;
        page: number;
        perPage: number;
        type: string;
        genres: string | string[];
        id: string;
        format: string;
        sort: string | string[];
        status: string;
        year: number;
        season: string;
      };

    const anilist = new META.Anilist();

    if (genres) {
      JSON.parse(genres as string).forEach((genre: string) => {
        if (!Object.values(Genres).includes(genre as Genres)) {
          return reply.status(400).send({ message: `${genre} is not a valid genre` });
        }
      });

      genres = JSON.parse(genres as string);
    }

    if (sort) sort = JSON.parse(sort as string);

    if (season)
      if (!["WINTER", "SPRING", "SUMMER", "FALL"].includes(season))
        return reply.status(400).send({ message: `${season} is not a valid season` });

    const res = await anilist.advancedSearch(
      query,
      type,
      page,
      perPage,
      format,
      sort as string[],
      genres as string[],
      id,
      year,
      status,
      season
    );

    reply.status(200).send(res);
  });

  fastify.post("/advanced-search", async (request: FastifyRequest, reply: FastifyReply) => {
    let { query, page, perPage, type, genres, id, format, sort, status, year, season } =
      request.body as {
        query: string;
        page: number;
        perPage: number;
        type: string;
        genres: string | string[];
        id: string;
        format: string;
        sort: string | string[];
        status: string;
        year: number;
        season: string;
      };

    const anilist = new META.Anilist();

    if (genres) {
      JSON.parse(genres as string).forEach((genre: string) => {
        if (!Object.values(Genres).includes(genre as Genres)) {
          return reply.status(400).send({ message: `${genre} is not a valid genre` });
        }
      });

      genres = JSON.parse(genres as string);
    }

    if (sort) sort = JSON.parse(sort as string);

    if (season)
      if (!["WINTER", "SPRING", "SUMMER", "FALL"].includes(season))
        return reply.status(400).send({ message: `${season} is not a valid season` });

    const res = await anilist.advancedSearch(
      query,
      type,
      page,
      perPage,
      format,
      sort as string[],
      genres as string[],
      id,
      year,
      status,
      season
    );

    reply.status(200).send(res);
  });

  fastify.get("/airing-schedule", async (request: FastifyRequest, reply: FastifyReply) => {
    let {
      page = 1,
      perPage,
      weekStart,
      weekEnd,
      notYetAired,
    } = request.query as {
      page: number;
      perPage: number;
      weekStart: number | string;
      weekEnd: number | string;
      notYetAired: boolean;
    };

    const anilist = new META.Anilist();

    const res = await anilist.fetchAiringSchedule(page, perPage, weekStart, weekEnd, notYetAired);

    reply.status(200).send(res);
  });

  fastify.get("/episodes/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    const now = new Date();
    const today = now.getDay();

    const { id } = request.params as { id: string };
    let { provider, dub, fetchFiller } = request.query as {
      provider: string;
      dub: string | boolean;
      fetchFiller: string | boolean;
    };

    let anilist = generateAnilistMeta(provider);

    if (dub === "true" || dub === "1") dub = true;
    else dub = false;

    if (fetchFiller === "true" || fetchFiller === "1") fetchFiller = true;
    else fetchFiller = false;

    try {
      let data = await cache.fetch(
        `anilist:episodes;${id};${dub};${fetchFiller};${anilist.provider.name.toLowerCase()}`,
        async () => anilist.fetchEpisodesListById(id, dub as boolean, fetchFiller as boolean),
        today === 0 || today === 6 ? 60 * 120 : (60 * 60) / 2
      );

      const res = data
        ? data
        : await anilist.fetchEpisodesListById(id, dub as boolean, fetchFiller as boolean);

      return reply.code(200).send(res);
    } catch (err) {
      return reply.code(500).send({ error: (err as Error).message });
    }
  });
};

const generateAnilistMeta = (provider: string | undefined = undefined): Anilist => {
  if (typeof provider !== "undefined") {
    let possibleProvider = PROVIDERS_LIST.ANIME.find(
      (p: any) => p.name.toLowerCase() === provider.toLocaleLowerCase()
    );

    if (possibleProvider instanceof NineAnime) {
      possibleProvider = new ANIME.NineAnime(
        process.env?.NINE_ANIME_HELPER_URL,
        {
          url: process.env?.NINE_ANIME_PROXY as string,
        },
        process.env?.NINE_ANIME_HELPER_KEY as string
      );
    }

    return new META.Anilist(possibleProvider, {
      url: process.env.PROXY as string | string[],
    });
  } else {
    return new Anilist(undefined, {
      url: process.env.PROXY as string | string[],
    });
  }
};

export default routes;
