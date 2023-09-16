import { NEWS, Topics } from "@consumet/extensions";
import { FastifyRequest, FastifyReply, FastifyInstance, RegisterOptions } from "fastify";
import { cache } from "../../../utils";

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
  const ann = new NEWS.ANN();

  fastify.get("/recent-feeds", async (req: FastifyRequest, reply: FastifyReply) => {
    let { topic } = req.query as { topic?: Topics };

    try {
      let data = await cache.fetch(
        `ann:recent-feeds:${topic}`,
        async () => await ann.fetchNewsFeeds(topic),
        60 * 60 * 3
      );

      const res = data ? data : await ann.fetchNewsFeeds(topic);

      reply.status(200).send(res);
    } catch (e) {
      reply.status(500).send({
        message: (e as Error).message,
      });
    }
  });

  fastify.get("/info", async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.query as { id: string };

    if (typeof id === "undefined")
      return reply.status(400).send({
        message: "id is required",
      });

    try {
      let data = await cache.fetch(
        `ann:info:${id}`,
        async () => await ann.fetchNewsInfo(id),
        60 * 60 * 10
      );

      const res = data ? data : await ann.fetchNewsInfo(id);

      reply.status(200).send(res);
    } catch (error) {
      reply.status(500).send({
        message: (error as Error).message,
      });
    }
  });
};

export default routes;
