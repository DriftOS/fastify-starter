import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import httpProxy from '@fastify/http-proxy';

const grafanaRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  // Proxy all /grafana requests to Grafana service
  // In Railway: add Grafana as a separate service, it will be available at http://grafana:3000
  // In local dev: docker-compose provides grafana service at http://grafana:3000
  const grafanaUrl = process.env.GRAFANA_URL || 'http://grafana:3000';
  
  await fastify.register(httpProxy, {
    upstream: grafanaUrl,
    prefix: '/grafana',
    rewritePrefix: '/',
    http2: false,
  });
};

export default grafanaRoutes;
