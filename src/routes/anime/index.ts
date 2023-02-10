import { FastifyInstance, RegisterOptions } from "fastify";

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
  fastify.get("/", async (request, reply) => {
    return { hello: "world" };
  });
};
