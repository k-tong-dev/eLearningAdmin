/**
 * Middleware to handle Content Manager preview URL requests
 * Prevents 404 errors when Strapi tries to get preview URLs for content types
 */

export default (config, { strapi }) => {
  return async (ctx, next) => {
    // Check if this is a preview URL request
    if (ctx.request.url.includes('/content-manager/preview/url/')) {
      console.log('[Preview URL Middleware] Handling preview URL request:', ctx.request.url);
      
      // Return null URL to indicate no preview is available
      // This prevents the 404 error and allows the admin UI to continue working
      ctx.body = {
        data: {
          url: null,
        },
      };
      ctx.status = 200;
      return;
    }
    
    // Continue with the request
    await next();
  };
};

