import { FastifyInstance, RegisterOptions } from "fastify";
import { auth } from "../utils";

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

    if (!email || !password || !username)
      return reply
        .code(400)
        .send("Bad Request: Missing email, username or password");

    const user = await auth.signup(email, password, username);

    return user;
  });
};

export default routes;
