import fp from 'fastify-plugin';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import type { FastifyPluginAsync } from 'fastify';

const swaggerPlugin: FastifyPluginAsync = async (fastify) => {
  // Register Swagger
  await fastify.register(fastifySwagger, {
    swagger: {
      info: {
        title: 'Fastify Gold Standard API',
        description: 'Production-ready Fastify starter with TypeScript, Prisma, and Docker',
        version: '1.0.0',
      },
      host: `${fastify.config.HOST}:${fastify.config.PORT}`,
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [
        { name: 'Health', description: 'Health check endpoints' },
        { name: 'Auth', description: 'Authentication endpoints' },
        { name: 'Users', description: 'User management endpoints' },
        { name: 'Example', description: 'Example CRUD endpoints' },
      ],
      securityDefinitions: {
        Bearer: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
          description:
            'JWT Authorization header using the Bearer scheme. Example: "Bearer {token}"',
        },
      },
    },
  });

  // Register Swagger UI
  if (fastify.config.SWAGGER_ENABLED) {
    await fastify.register(fastifySwaggerUI, {
      routePrefix: fastify.config.SWAGGER_PATH,
      uiConfig: {
        docExpansion: 'none',
        deepLinking: true,
        persistAuthorization: true,
      },
      staticCSP: true,
      transformStaticCSP: (header) => header,
      transformSpecification: (swaggerObject, _req, _reply) => {
        return swaggerObject;
      },
    });
  }
};

export default fp(swaggerPlugin, {
  name: 'swagger',
  dependencies: ['env'],
});
