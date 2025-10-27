import type { Core } from '@strapi/strapi';

export default {

  register({ strapi }: { strapi: Core.Strapi }) {
    const extensionService = strapi.plugin('users-permissions').service('extension');
    console.log('Registered routes:', extensionService);
  },
  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    console.log('Bootstrapping Strapi...', strapi);
  },
};
