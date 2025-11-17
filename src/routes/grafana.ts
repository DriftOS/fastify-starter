import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import httpProxy from '@fastify/http-proxy';

const grafanaRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  // Proxy all /grafana requests to Grafana service (OPTIONAL)
  // In Railway: add Grafana as a separate Docker service (grafana/grafana:latest)
  // In local dev: docker-compose provides grafana service at http://grafana:3000
  const grafanaUrl = process.env.GRAFANA_URL;
  
  if (!grafanaUrl) {
    // Grafana not configured - register a fallback route
    fastify.get('/grafana*', async (_request, reply) => {
      return reply.code(503).send({
        error: 'Service Unavailable',
        message: 'Grafana is not configured. Add GRAFANA_URL environment variable or deploy Grafana service.',
        hint: 'See DEPLOY.md for instructions',
      });
    });
    fastify.log.info('Grafana proxy not configured - /grafana endpoint will return 503');
    return;
  }
  
  // Grafana is configured - set up proxy
  await fastify.register(httpProxy, {
    upstream: grafanaUrl,
    prefix: '/grafana',
    rewritePrefix: '/',
    http2: false,
    // Forward original host header so Grafana knows the public domain
    replyOptions: {
      rewriteRequestHeaders: (_req, headers) => {
        return {
          ...headers,
          // Preserve the original host header for Grafana
          'x-forwarded-host': headers.host || headers['x-forwarded-host'],
          'x-forwarded-proto': headers['x-forwarded-proto'] || 'https',
        };
      },
    },
  });
  
  fastify.log.info(`Grafana proxy configured: ${grafanaUrl}`);
};

export default grafanaRoutes;
