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
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'res.cloudinary.com', // Cloudinary images
            'https://res.cloudinary.com',
            'market-assets.strapi.io',
            'strapi-ai-staging.s3.us-east-1.amazonaws.com',
            'strapi-ai-production.s3.us-east-1.amazonaws.com',
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'res.cloudinary.com',
            'https://res.cloudinary.com',
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
