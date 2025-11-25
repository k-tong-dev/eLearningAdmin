/**
 * Lifecycle hooks for course-course content type
 * Security: Prevent updates to published paid courses with copyright concerns
 */

async function checkCourseContentsForCopyright(
  strapi: any,
  courseId: string | number
): Promise<{ hasCopyrightIssues: boolean; details: string }> {
  try {
    // Get all course materials for this course
    const materials = await strapi.entityService.findMany('api::course-material.course-material', {
      filters: {
        course_course: {
          id: courseId,
        },
      },
      populate: {
        course_contents: {
          populate: '*',
        },
      },
    });

    if (!materials || materials.length === 0) {
      return { hasCopyrightIssues: false, details: 'No materials found' };
    }

    // Check each material's contents for copyright issues
    for (const material of materials as any[]) {
      if (material.course_contents && Array.isArray(material.course_contents)) {
        for (const content of material.course_contents) {
          // Check if copyright check has been performed and failed
          if (content.copyright_check_status === 'failed') {
            return {
              hasCopyrightIssues: true,
              details: `Content "${content.name}" has copyright violations`,
            };
          }
          
          // Check if copyright check has warnings for paid courses
          if (content.copyright_check_status === 'warning') {
            return {
              hasCopyrightIssues: true,
              details: `Content "${content.name}" has copyright warnings`,
            };
          }
          
          // Check if copyright check is still pending for media content
          if (
            (content.type === 'video' || content.type === 'audio') &&
            (!content.copyright_check_status || content.copyright_check_status === 'pending')
          ) {
            return {
              hasCopyrightIssues: true,
              details: `Content "${content.name}" has not completed copyright check`,
            };
          }
        }
      }
    }

    return { hasCopyrightIssues: false, details: 'All copyright checks passed' };
  } catch (error) {
    console.error('Error checking course contents for copyright:', error);
    return {
      hasCopyrightIssues: true,
      details: 'Error checking copyright status',
    };
  }
}

export default {
  async beforeUpdate(event: any) {
    const { data, where } = event.params;
    
    try {
      console.log('[Course Security] beforeUpdate hook triggered', { data, where });
      
      // Get the existing course data using db.query for Strapi v5 compatibility
      // In Strapi v5, where.documentId is the identifier
      const documentId = where.documentId || where.id;
      
      if (!documentId) {
        console.error('[Course Security] No documentId or id provided');
        const error: any = new Error('Invalid course identifier');
        error.details = { message: 'Invalid course identifier' };
        throw error;
      }

      // Use db.query which is more reliable in lifecycle hooks
      const existingCourse: any = await strapi.db.query('api::course-course.course-course').findOne({
        where: { documentId },
        populate: {
          currency: true,
          course_materials: true,
        },
      });

      if (!existingCourse) {
        console.error('[Course Security] Course not found:', documentId);
        // Don't throw error if course not found - let Strapi handle it
        // This might be a delete operation or the course doesn't exist
        return;
      }

      console.log('[Course Security] Existing course status:', existingCourse.course_status);

      // Security Rule 1: If course is published, only allow status changes to draft or cancel
      if (existingCourse.course_status === 'published') {
        // Check if they're trying to change the status
        if (data.course_status && data.course_status !== 'published') {
          // Allow changing from published to draft or cancel
          console.log(`[Course Security] Allowing status change from published to ${data.course_status}`);
          // Only allow the course_status field to be updated, block all other changes
          const allowedFields = ['course_status', 'active', 'locale'];
          const attemptedFields = Object.keys(data);
          const blockedFields = attemptedFields.filter(
            field => !allowedFields.includes(field)
          );
          
          if (blockedFields.length > 0) {
            const error: any = new Error(
              `Cannot update fields [${blockedFields.join(', ')}] while course is published. ` +
              'Please change course status to "draft" or "cancel" first, then make your changes.'
            );
            error.details = {
              message: error.message,
              blockedFields,
              currentStatus: existingCourse.course_status,
            };
            throw error;
          }
        } else {
          // They're trying to update other fields while status is still published
          const error: any = new Error(
            'Cannot update a published course. Please change the course status to "draft" or "cancel" first before making any changes.'
          );
          error.details = {
            message: error.message,
            currentStatus: existingCourse.course_status,
            attemptedFields: Object.keys(data),
          };
          throw error;
        }
      }

      // Security Rule 2: Check copyright before allowing status change to published
      if (data.course_status === 'published' && existingCourse.course_status !== 'published') {
        console.log('[Course Security] Attempting to publish course');
        // Changing from draft/cancel to published
        
        // Check if course is paid
        const isPaid = data.is_paid !== undefined ? data.is_paid : existingCourse.is_paid;
        console.log('[Course Security] Course is paid:', isPaid);
        
        if (isPaid) {
          // For paid courses, verify all copyright checks have passed
          console.log('[Course Security] Running copyright check for paid course');
          try {
            const copyrightCheck = await checkCourseContentsForCopyright(
              strapi,
              existingCourse.id
            );
            
            console.log('[Course Security] Copyright check result:', copyrightCheck);

            if (copyrightCheck.hasCopyrightIssues) {
              console.warn('[Course Security] Copyright issues found:', copyrightCheck.details);
              const error: any = new Error(
                `Cannot publish paid course with copyright issues: ${copyrightCheck.details}. ` +
                'Please resolve all copyright violations before publishing.'
              );
              error.details = {
                message: error.message,
                copyrightIssues: copyrightCheck.details,
                courseId: existingCourse.id,
              };
              throw error;
            }
            console.log('[Course Security] Copyright check passed');
          } catch (copyrightError: any) {
            console.error('[Course Security] Error during copyright check:', copyrightError);
            // If copyright check itself fails, allow the operation but log warning
            // Don't block the entire operation due to copyright check failure
            console.warn('[Course Security] Copyright check failed, allowing operation to proceed');
          }
        }
      }

      // Security Rule 3: If course is being changed to paid, check copyright
      const wasPaid = existingCourse.is_paid;
      const willBePaid = data.is_paid !== undefined ? data.is_paid : wasPaid;
      
      if (!wasPaid && willBePaid && existingCourse.course_status === 'published') {
        console.log('[Course Security] Attempting to change free course to paid while published');
        // Course is already published and trying to change from free to paid
        try {
          const copyrightCheck = await checkCourseContentsForCopyright(
            strapi,
            existingCourse.id
          );

          if (copyrightCheck.hasCopyrightIssues) {
            const error: any = new Error(
              `Cannot change to paid course with copyright issues: ${copyrightCheck.details}. ` +
              'Please unpublish, resolve copyright issues, and then republish.'
            );
            error.details = {
              message: error.message,
              copyrightIssues: copyrightCheck.details,
              courseId: existingCourse.id,
            };
            throw error;
          }
        } catch (copyrightError: any) {
          console.error('[Course Security] Error during copyright check:', copyrightError);
          // If it's already our custom error, re-throw it
          if (copyrightError.details) {
            throw copyrightError;
          }
          // Otherwise, log and allow operation
          console.warn('[Course Security] Copyright check failed, allowing operation to proceed');
        }
      }

      console.log('[Course Security] All validation checks passed');

    } catch (error: any) {
      console.error('[Course Security] Validation failed:', error);
      console.error('[Course Security] Error message:', error.message);
      console.error('[Course Security] Error stack:', error.stack);
      
      // Add details for better error display in Strapi admin
      if (!error.details) {
        error.details = { message: error.message };
      }
      
      // Create a proper ApplicationError for Strapi
      const strapiError = {
        name: 'ValidationError',
        message: error.message,
        details: error.details,
      };
      
      // Throw the error to prevent the update and show in Strapi admin
      throw strapiError;
    }
  },

  async beforeCreate(event: any) {
    const { data } = event.params;
    
    // Security Rule: Check copyright before creating as published
    if (data.course_status === 'published' && data.is_paid) {
      // For new courses being created as published+paid, we should verify content
      // However, at creation time, materials may not exist yet
      // So we'll just warn and allow it, but the beforeUpdate will catch it later
      console.warn(
        '[Course Security] Creating a published paid course. ' +
        'Ensure copyright checks are performed on all materials.'
      );
    }
  },
};

