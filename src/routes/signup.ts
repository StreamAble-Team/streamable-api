import { FastifyInstance, RegisterOptions } from "fastify";
import { signup } from "../utils/signup";

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
  fastify.get("/", async (request, reply) => {
    return { message: "Hello World" };
  });

  fastify.post("/signup", async (request, reply) => {
    const { email, username, password } = request.body as {
      email: string;
      password: string;
      username: string;
    };

    const user = await signup(email, password, username);

    return user;
  });
};

export default routes;
