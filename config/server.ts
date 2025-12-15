export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  url: process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337',
  proxy: true,
  logger: {
    level: 'info',
  },
});
