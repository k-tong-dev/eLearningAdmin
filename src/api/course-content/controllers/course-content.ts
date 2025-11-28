/**
 * course-content controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::course-content.course-content', ({ strapi }) => ({
  /**
   * Custom create method to check copyright before saving
   */
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      
      console.log('[Course Content] Create request received:', data);
      
      // Check if this content needs copyright validation
      const needsCopyrightCheck = ['video', 'url', 'image'].includes(data.type);
      
      if (needsCopyrightCheck) {
        console.log(`[Course Content] Copyright check needed for type: ${data.type}`);
        
        // Initialize copyright_information if not provided
        if (!data.copyright_information) {
          data.copyright_information = {
            copyrighted: false, // Assume safe until checked
            copy_right_status: 'pending',
            copyright_check_date: new Date().toISOString(),
          };
        }
      }
      
      // Call default create method
      const response = await super.create(ctx);
      
      console.log('[Course Content] Content created successfully');
      return response;
    } catch (error: any) {
      console.error('[Course Content] Create failed:', error);
      return ctx.badRequest(error.message, {
        error: {
          name: error.name || 'ValidationError',
          message: error.message,
          details: error.details || {},
        },
      });
    }
  },
  
  /**
   * Custom update method to handle copyright information updates
   */
  async update(ctx) {
    try {
      console.log('[Course Content] Update request received');
      
      // Call default update method
      const response = await super.update(ctx);
      
      console.log('[Course Content] Content updated successfully');
      return response;
    } catch (error: any) {
      console.error('[Course Content] Update failed:', error);
      return ctx.badRequest(error.message, {
        error: {
          name: error.name || 'ValidationError',
          message: error.message,
          details: error.details || {},
        },
      });
    }
  },
}));
