import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

const rootRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get('/', async (_request, reply) => {
    const baseUrl = `${_request.protocol}://${_request.hostname}`;
    
    return reply.send({
      message: 'Welcome to Fastify Gold Standard Starter',
      documentation: `${baseUrl}/documentation`,
      health: `${baseUrl}${fastify.config.API_PREFIX}/${fastify.config.API_VERSION}/health`,
      metrics: `${baseUrl}/metrics`,
      github: 'https://github.com/DriftOS/fastify-starter',
      docs: 'https://github.com/DriftOS/fastify-starter#readme',
    });
  });
};

export default rootRoutes;
