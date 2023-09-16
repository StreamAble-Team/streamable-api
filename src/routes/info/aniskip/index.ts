import axios from "axios";
import { FastifyRequest, FastifyReply, FastifyInstance, RegisterOptions } from "fastify";

import { cache } from "../../../utils";

const routes = async (fastify: FastifyInstance, opts: RegisterOptions) => {
  const api = (malid: number, episode: number) =>
    `https://api.aniskip.com/v2/skip-times/${malid}/${episode}?types[]=ed&types[]=mixed-ed&types[]=mixed-op&types[]=op&types[]=recap&episodeLength=`;

  fastify.get("/:malid/:episode", async (request: FastifyRequest, reply: FastifyReply) => {
    const { malid, episode } = request.params as {
      malid: number;
      episode: number;
    };

    const url = await api(malid, episode);

    const { data } = await axios.get(url);

    if (data?.found === false) return reply.code(404).send({ error: "Not Found" });

    if (data?.results?.length === 0)
      return reply.code(204).send({
        error: "No results found",
      });

    return data?.results;
  });
};

export default routes;
