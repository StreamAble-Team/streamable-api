import { DropdownData } from "./../../@types/types";
import { EXTENSION_LIST } from "apollotv-providers";
import {
  FastifyRequest,
  FastifyReply,
  FastifyInstance,
  RegisterOptions,
  RouteGenericInterface,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from "fastify";

type ProvidersRequest = FastifyRequest<{
  Querystring: { type: keyof typeof EXTENSION_LIST };
}>;

interface AppProvidersRes extends RouteGenericInterface {
  Querystring: { type: keyof typeof EXTENSION_LIST };
  Reply: DropdownData[]; // put the response payload interface here
}

export default class Providers {
  public getProviders = async (fastify: FastifyInstance, options: RegisterOptions) => {
    fastify.get(
      "/utils/providers/:type",
      {
        preValidation: (request, reply, done) => {
          const { type } = request.params as { type: string };

          const providerTypes = Object.keys(EXTENSION_LIST).map((element) => element.toLowerCase());

          if (type === undefined) {
            reply.status(400);
            done(new Error("Type must not be empty. Available types: " + providerTypes.toString()));
          }

          if (!providerTypes.includes(type.toLowerCase())) {
            reply.status(400);
            done(new Error("Type must be either: " + providerTypes.toString()));
          }

          done(undefined);
        },
      },
      async (request: ProvidersRequest, reply: FastifyReply) => {
        let { type } = request.params as {
          type: keyof typeof EXTENSION_LIST;
        };

        type = type.toUpperCase() as keyof typeof EXTENSION_LIST;

        const providers = Object.values(EXTENSION_LIST[type]).sort((one, two) =>
          one.metaData.name.localeCompare(two.metaData.name)
        );

        reply.status(200).send(
          providers.map((element) => ({
            name: element.metaData.name.toLowerCase(),
            type: element.metaData.type.toUpperCase(),
            version: element.metaData.version,
            image: element.metaData.image,
            author: element.metaData.author,
          }))
        );
      }
    );
  };

  public getAppExtensions = async (fastify: FastifyInstance, options: RegisterOptions) => {
    fastify.get(
      "/app/extensions/:type",
      {
        preValidation: (
          request,
          reply: FastifyReply<
            RawServerDefault,
            RawRequestDefaultExpression,
            RawReplyDefaultExpression,
            AppProvidersRes
          >,
          done
        ) => {
          const { type } = request.params as { type: string };

          const providerTypes = Object.keys(EXTENSION_LIST).map((element) => element.toLowerCase());

          if (type === undefined) {
            reply.status(400);
            done(new Error("Type must not be empty. Available types: " + providerTypes.toString()));
          }

          if (!providerTypes.includes(type.toLowerCase())) {
            reply.status(400);
            done(new Error("Type must be either: " + providerTypes.toString()));
          }

          done(undefined);
        },
      },
      async (request: ProvidersRequest, reply: FastifyReply) => {
        let { type } = request.params as {
          type: keyof typeof EXTENSION_LIST;
        };

        type = type.toUpperCase() as keyof typeof EXTENSION_LIST;

        const providers = Object.values(EXTENSION_LIST[type]).sort((one, two) =>
          one.metaData.name.localeCompare(two.metaData.name)
        );

        reply.status(200).send(
          providers
            .map((element, i) => {
              if (element?.metaData.name.toLowerCase().includes("allanime")) return;
              return {
                label: element.metaData.name.toLowerCase(),
                value: (i + 1).toString(),
                image: element.metaData.image,
              };
            })
            .filter((el) => el?.label)
        );
      }
    );
  };
}
