import { FastifyInstance, RegisterOptions } from "fastify";

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
  fastify.get("/", async (request, reply) => {
    return { message: "Hello World" };
  });
};

export default routes;
