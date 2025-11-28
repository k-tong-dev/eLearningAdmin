/**
 * card-item router
 */

export default {
  routes: [
    // Custom routes MUST come BEFORE parameterized routes (/:id)
    // Otherwise "me" will be interpreted as an ID
    {
      method: 'GET',
      path: '/card-items/me',
      handler: 'card-item.me',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/card-items/add',
      handler: 'card-item.addToCard',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/card-items/clear',
      handler: 'card-item.clearCard',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/card-items/:id/remove',
      handler: 'card-item.removeFromCard',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Default CRUD routes
    {
      method: 'GET',
      path: '/card-items',
      handler: 'card-item.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/card-items/:id',
      handler: 'card-item.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/card-items',
      handler: 'card-item.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/card-items/:id',
      handler: 'card-item.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/card-items/:id',
      handler: 'card-item.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
