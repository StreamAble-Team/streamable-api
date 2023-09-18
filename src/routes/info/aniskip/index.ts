import axios from "axios";
import { FastifyRequest, FastifyReply, FastifyInstance, RegisterOptions } from "fastify";

const routes = async (fastify: FastifyInstance, opts: RegisterOptions) => {
  const api = (malid: number, episode: number) =>
    `https://api.aniskip.com/v2/skip-times/${malid}/${episode}?types[]=ed&types[]=mixed-ed&types[]=mixed-op&types[]=op&types[]=recap&episodeLength=`;

  fastify.get("/:malid/:episode", async (request: FastifyRequest, reply: FastifyReply) => {
    const { malid, episode } = request.params as {
      malid: number;
      episode: number;
    };

    try {
      const url = api(malid, episode);

      const { data } = await axios.get(url);

      if (data?.found === false) return reply.code(404).send({ error: "Not Found" });

      if (data?.results?.length === 0)
        return reply.code(204).send({
          isError: true,
          error: "No skip times found",
        });

      return { ...data?.results, isError: false };
    } catch (error) {
      return reply.code(404).send({
        isError: true,
        error: "No skip times found",
      });
    }
  });
};

export default routes;
