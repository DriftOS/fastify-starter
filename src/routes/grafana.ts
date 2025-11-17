import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

const grafanaRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  // Proxy all /grafana requests to local Grafana instance
  await fastify.register(require('@fastify/http-proxy'), {
    upstream: 'http://localhost:3000',
    prefix: '/grafana',
    rewritePrefix: '/',
    http2: false,
  });
};

export default grafanaRoutes;
