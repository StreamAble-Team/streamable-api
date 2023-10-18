import { FastifyRequest, FastifyReply, FastifyInstance, RegisterOptions } from "fastify";
import { PROVIDERS_LIST } from "@consumet/extensions";

import { EXTENSION_LIST, INFO, MANGA } from "apollotv-providers";
import { IReadableResult, ISearch, MediaStatus } from "apollotv-providers/dist/types";
import { Anilist } from "@tdanks2000/anilist-wrapper";

import { cache } from "../../../utils";

const routes = async (fastify: FastifyInstance, opts: RegisterOptions) => {
  let anilist = new INFO.Anilist.Manga(new MANGA.MangaDex());
  let anilistD = new Anilist().search;

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
      const possibleProvider = EXTENSION_LIST.MANGA.find(
        (p) => p.metaData.name.toLowerCase() === provider.toLocaleLowerCase()
      );
      anilist = new INFO.Anilist.Manga(possibleProvider);
    }

    try {
      let data = await cache.fetch(
        `anilist:manga:info;${id};${anilist.provider.metaData.name.toLowerCase()}`,
        async () => await anilist.getMediaInfo(id),
        today === 0 || today === 6 ? 60 * 120 : (60 * 60) / 2
      );

      let res = data ? data : await anilist.getMediaInfo(id);

      reply.code(200).send(res);
      anilist = new INFO.Anilist.Manga(new MANGA.MangaDex());
    } catch (err) {
      console.log(err);
      reply.status(500).send({ error: err ?? "Unkown Error" });
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

    if (typeof provider !== "undefined") {
      const possibleProvider = EXTENSION_LIST.MANGA.find(
        (p) => p.metaData.name.toLowerCase() === provider.toLocaleLowerCase()
      );
      anilist = new INFO.Anilist.Manga(possibleProvider);
    }

    try {
      let data = await cache.fetch(
        `anilist:manga:read;${chapterId};${anilist.provider.metaData.name.toLowerCase()}`,
        async () => await anilist.getChapterPages(chapterId),
        600
      );

      console.log(
        `anilist:manga:read;${chapterId};${anilist.provider.metaData.name.toLowerCase()}`
      );

      let res = data ? data : await anilist.getChapterPages(chapterId);

      reply.code(200).send(res);
      anilist = new INFO.Anilist.Manga(new MANGA.MangaDex());
    } catch (err) {
      console.log(err);
      reply.status(500).send({ error: err });
    }
  });
};

const convert_result = (data: any) => {
  const res: ISearch<IReadableResult> = {
    currentPage: data.data.Page.pageInfo.currentPage,
    hasNextPage: data.data.Page.pageInfo.hasNextPage,
    results: data.data.Page.media.map(
      (item: any): IReadableResult => ({
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
