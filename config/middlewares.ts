const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:1337';

export default [
  'strapi::errors',
  {
    name: 'strapi::cors',
    config: {
      enable: true,
      origin: [`${FRONTEND_URL}`],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
    },
  },
  'strapi::security',
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
