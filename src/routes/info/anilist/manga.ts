import { FastifyRequest, FastifyReply, FastifyInstance, RegisterOptions } from "fastify";
import { META, MediaStatus, IMangaResult, ISearch } from "@consumet/extensions";
import { PROVIDERS_LIST } from "@consumet/extensions";

import { INFO } from "apollotv-providers";
import { Anilist } from "@tdanks2000/anilist-wrapper";

import { cache } from "../../../utils";

const routes = async (fastify: FastifyInstance, opts: RegisterOptions) => {
  let anilist = new META.Anilist.Manga();
  let anilistD = new Anilist().search;

  let anilistA = new INFO.Anilist().Manga;

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

    const isMangaSee =
      (typeof provider !== "undefined" && provider.toLowerCase().includes("mangasee")) ||
      anilist.provider.name.toLowerCase().includes("mangasee");

    if (typeof provider !== "undefined") {
      if (!isMangaSee) {
        const possibleProvider = PROVIDERS_LIST.MANGA.find(
          (p) => p.name.toLowerCase() === provider.toLocaleLowerCase()
        );
        anilist = new META.Anilist.Manga(possibleProvider);
      }
    }

    try {
      let data = await cache.fetch(
        `anilist:manga:info;${id};${anilist.provider.name.toLowerCase()}`,
        async () =>
          isMangaSee ? await anilistA.getMediaInfo(id) : await anilist.fetchMangaInfo(id),
        today === 0 || today === 6 ? 60 * 120 : (60 * 60) / 2
      );

      let res = data
        ? data
        : isMangaSee
        ? await anilistA.getMediaInfo(id)
        : await anilist.fetchMangaInfo(id);

      reply.code(200).send(res);
      anilist = new META.Anilist.Manga();
      anilistA = new INFO.Anilist().Manga;
    } catch (err) {
      reply.status(500).send({ error: err });
    }
  });

  fastify.get("/trending", async (request: FastifyRequest, reply: FastifyReply) => {
    const { page = 1, perPage } = request.query as {
      page: number;
      perPage: number;
    };

    try {
      let data = await cache.fetch(
        `anilist:manga:tredning;${page}`,
        async () =>
          convert_result(
            await anilistD.advanced_manga({
              page,
              size: 50,
              sort: ["TRENDING_DESC"],
            })
          ),
        60 * 60 * 24
      );

      let res = data
        ? data
        : convert_result(
            await anilistD.advanced_manga({
              page,
              size: perPage,
              sort: ["TRENDING_DESC"],
            })
          );

      reply.code(200).send(res);
    } catch (err) {
      reply.status(500).send({ error: err });
    }
  });

  fastify.get("/popular", async (request: FastifyRequest, reply: FastifyReply) => {
    const { page = 1, perPage } = request.query as {
      page: number;
      perPage: number;
    };

    try {
      let data = await cache.fetch(
        `anilist:manga:popular;${page}`,
        async () =>
          convert_result(
            await anilistD.advanced_manga({
              page,
              size: 50,
              sort: ["POPULARITY_DESC"],
            })
          ),
        60 * 60 * 24
      );

      let res = data
        ? data
        : convert_result(
            await anilistD.advanced_manga({
              page,
              size: perPage,
              sort: ["POPULARITY_DESC"],
            })
          );

      reply.code(200).send(res);
    } catch (err) {
      reply.status(500).send({ error: err });
    }
  });

  fastify.get("/top-rated", async (request: FastifyRequest, reply: FastifyReply) => {
    const { page = 1, perPage } = request.query as {
      page: number;
      perPage: number;
    };

    try {
      let data = await cache.fetch(
        `anilist:manga:top-rated;${page}`,
        async () =>
          convert_result(
            await anilistD.advanced_manga({
              page,
              size: 50,
              sort: ["SCORE_DESC"],
            })
          ),
        60 * 60 * 24
      );

      let res = data
        ? data
        : convert_result(
            await anilistD.advanced_manga({
              page,
              size: perPage,
              sort: ["SCORE_DESC"],
            })
          );

      reply.code(200).send(res);
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

    const isMangaSee =
      (typeof provider !== "undefined" && provider.toLowerCase().includes("mangasee")) ||
      anilist.provider.name.toLowerCase().includes("mangasee");

    if (typeof provider !== "undefined") {
      if (!isMangaSee) {
        const possibleProvider = PROVIDERS_LIST.MANGA.find(
          (p) => p.name.toLowerCase() === provider.toLocaleLowerCase()
        );
        anilist = new META.Anilist.Manga(possibleProvider);
      }
    }

    try {
      let data = await cache.fetch(
        `anilist:manga:read;${chapterId};${anilist.provider.name.toLowerCase()}`,
        async () =>
          isMangaSee
            ? await anilistA.getChapterPages(chapterId)
            : await anilist.fetchChapterPages(chapterId),
        600
      );

      let res = data
        ? data
        : isMangaSee
        ? await anilistA.getChapterPages(chapterId)
        : await anilist.fetchChapterPages(chapterId);

      reply.code(200).send(res);
      anilist = new META.Anilist.Manga();
    } catch (err) {
      reply.status(500).send({ error: err });
    }
  });
};

const convert_result = (data: any) => {
  const res: ISearch<IMangaResult> = {
    currentPage: data.data.Page.pageInfo.currentPage,
    hasNextPage: data.data.Page.pageInfo.hasNextPage,
    results: data.data.Page.media.map(
      (item: any): IMangaResult => ({
        id: item.id.toString(),
        malId: item.idMal,
        title:
          {
            romaji: item.title.romaji,
            english: item.title.english,
            native: item.title.native,
            userPreferred: item.title.userPreferred,
          } || item.title.romaji,
        status:
          item.status == "RELEASING"
            ? MediaStatus.ONGOING
            : item.status == "FINISHED"
            ? MediaStatus.COMPLETED
            : item.status == "NOT_YET_RELEASED"
            ? MediaStatus.NOT_YET_AIRED
            : item.status == "CANCELLED"
            ? MediaStatus.CANCELLED
            : item.status == "HIATUS"
            ? MediaStatus.HIATUS
            : MediaStatus.UNKNOWN,
        image: item.coverImage?.extraLarge ?? item.coverImage?.large ?? item.coverImage?.medium,
        cover: item.bannerImage,
        popularity: item.popularity,
        description: item.description,
        rating: item.averageScore,
        genres: item.genres,
        color: item.coverImage?.color,
        totalChapters: item.chapters,
        volumes: item.volumes,
        type: item.format,
        releaseDate: item.seasonYear,
      })
    ),
  };

  return res;
};

export default routes;
