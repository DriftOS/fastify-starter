import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

const rootRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get('/', async (_request, reply) => {
    return reply.send({
      message: 'Welcome to Fastify Gold Standard Starter',
      documentation: `${fastify.config.API_PREFIX}/${fastify.config.API_VERSION}/documentation`,
      health: `${fastify.config.API_PREFIX}/${fastify.config.API_VERSION}/health`,
      metrics: '/metrics',
      github: 'https://github.com/DriftOS/fastify-starter',
      docs: 'https://github.com/DriftOS/fastify-starter#readme',
    });
  });
};

export default rootRoutes;
