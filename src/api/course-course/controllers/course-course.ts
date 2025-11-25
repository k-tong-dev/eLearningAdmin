/**
 * course-course controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::course-course.course-course', ({ strapi }) => ({
  // Extend the default update method to provide better error handling
  async update(ctx) {
    try {
      console.log('[Course Controller] Update request received');
      
      // Call the default update method
      const response = await super.update(ctx);
      
      console.log('[Course Controller] Update successful');
      return response;
    } catch (error: any) {
      console.error('[Course Controller] Update failed:', error);
      console.error('[Course Controller] Error message:', error.message);
      
      // Return a properly formatted error response
      return ctx.badRequest(error.message, {
        error: {
          name: error.name || 'ValidationError',
          message: error.message,
          details: error.details || {},
        },
      });
    }
  },
  
  // Handle preview URL requests from Strapi Content Manager
  async previewUrl(ctx) {
    try {
      const { documentId, locale, status } = ctx.query;
      
      console.log('[Course Controller] Preview URL request:', { documentId, locale, status });
      
      // If you have a frontend preview URL, construct it here
      // For example: `${process.env.FRONTEND_URL}/courses/${documentId}/preview`
      
      // For now, return null to indicate no preview URL is available
      // This prevents the 404 error
      return {
        data: {
          url: null, // Set this to your actual preview URL if you have one
        },
      };
    } catch (error: any) {
      console.error('[Course Controller] Preview URL error:', error);
      // Return null instead of error to prevent blocking the admin UI
      return {
        data: {
          url: null,
        },
      };
    }
  },
}));
