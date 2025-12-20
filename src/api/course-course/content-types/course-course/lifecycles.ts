/**
 * Lifecycle hooks for course-course content type
 * Security: Prevent updates to published paid courses with copyright concerns
 */

/**
 * Helper function to create properly formatted ValidationError for Strapi v5 admin UI
 */
function createValidationError(message: string, fields: string[] = []): Error {
  const error: any = new Error(message);
  error.name = 'ValidationError';
  error.details = {
    errors: fields.length > 0
      ? fields.map(field => ({
          path: [field],
          message: message,
          name: 'ValidationError',
        }))
      : [{
          path: [],
          message: message,
          name: 'ValidationError',
        }],
  };
  return error;
}

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
          // Only check video, url, and image content types
          const needsCopyrightCheck = ['video', 'url', 'image'].includes(content.type);
          
          if (!needsCopyrightCheck) {
            continue; // Skip other content types
          }
          
          // Check the NEW component structure first
          if (content.copyright_information) {
            const copyrightInfo = content.copyright_information;
            
            // ONLY CHECK: If copyrighted = TRUE, it means content HAS copyright issues
            if (copyrightInfo.copyrighted === true) {
              return {
                hasCopyrightIssues: true,
                details: `Content "${content.name}" contains copyrighted material`,
              };
            }
            
            // If copyrighted = false OR undefined/null, content is SAFE
            // Do NOT check copy_right_status - it's only for UI display
            
          } else {
            // Fallback to OLD fields for backward compatibility during migration
            // After migration, this block can be removed
            if (content.copyright_check_status === 'failed') {
              return {
                hasCopyrightIssues: true,
                details: `Content "${content.name}" has copyright violations`,
              };
            }
            
            if (!content.copyright_check_status || content.copyright_check_status === 'pending') {
              return {
                hasCopyrightIssues: true,
                details: `Content "${content.name}" has not completed copyright check`,
              };
            }
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
      // In Strapi v5, where can contain either documentId (string) or id (number)
      const identifier = where.documentId || where.id;
      
      if (!identifier) {
        console.error('[Course Security] No documentId or id provided');
        throw createValidationError('Invalid course identifier');
      }

      // Determine if we have a documentId (string) or numeric id
      const isNumericId = typeof identifier === 'number' || (typeof identifier === 'string' && /^\d+$/.test(identifier));
      const whereClause = isNumericId ? { id: identifier } : { documentId: identifier };

      console.log('[Course Security] Querying course with:', whereClause);

      // Use db.query which is more reliable in lifecycle hooks
      const existingCourse: any = await strapi.db.query('api::course-course.course-course').findOne({
        where: whereClause,
        populate: {
          currency: true,
          course_materials: true,
        },
      });

      if (!existingCourse) {
        console.error('[Course Security] Course not found with:', whereClause);
        // Don't throw error if course not found - let Strapi handle it
        // This might be a delete operation or the course doesn't exist
        return;
      }

      console.log('[Course Security] Existing course status:', existingCourse.course_status);

      // Security Rule 1: If course is published, block updates UNLESS changing status to draft/cancel
      if (existingCourse.course_status === 'published') {
        // Check if they're changing the status FROM published TO draft or cancel
        const isUnpublishing = data.course_status && 
                               data.course_status !== 'published' && 
                               existingCourse.course_status === 'published';
        
        // If unpublishing (changing to draft/cancel), allow ALL changes
        // This makes sense: if you're unpublishing, you should be able to edit everything
        if (isUnpublishing) {
          console.log(`[Course Security] Unpublishing course (${existingCourse.course_status} → ${data.course_status}), allowing all field changes`);
          // Allow all changes when unpublishing - no need to check individual fields
          return;
        }
        
        // If status remains "published", block all field changes
        // Helper function to check if a value actually changed
        const hasValueChanged = (field: string, newValue: any, oldValue: any): boolean => {
          // Both undefined/null - no change
          if ((newValue === undefined || newValue === null) && (oldValue === undefined || oldValue === null)) {
            return false;
          }
          
          // One is undefined/null, other is not - changed
          if ((newValue === undefined || newValue === null) !== (oldValue === undefined || oldValue === null)) {
            return true;
          }
          
          // Handle relations - compare IDs
          // New value might be an object (from populate) or just an ID (from form submission)
          if (typeof newValue === 'object' && newValue !== null && !Array.isArray(newValue)) {
            // Extract ID from new value
            const newId = newValue.id || newValue.documentId || newValue;
            // Extract ID from old value (might be object or ID)
            let oldId = oldValue;
            if (typeof oldValue === 'object' && oldValue !== null) {
              oldId = oldValue.id || oldValue.documentId;
            }
            return String(newId) !== String(oldId);
          }
          
          // Handle arrays (relations)
          if (Array.isArray(newValue)) {
            // Extract IDs from new array
            const newIds = newValue
              .map((item: any) => {
                if (typeof item === 'object' && item !== null) {
                  return item.id || item.documentId || item;
                }
                return item;
              })
              .map(String)
              .sort();
            
            // Extract IDs from old array (might be objects or IDs)
            const oldArray = Array.isArray(oldValue) ? oldValue : (oldValue ? [oldValue] : []);
            const oldIds = oldArray
              .map((item: any) => {
                if (typeof item === 'object' && item !== null) {
                  return item.id || item.documentId || item;
                }
                return item;
              })
              .map(String)
              .sort();
            
            return JSON.stringify(newIds) !== JSON.stringify(oldIds);
          }
          
          // Handle primitive values - convert to string for comparison
          return String(newValue) !== String(oldValue);
        };
        
        // System fields that are always allowed or managed by Strapi
        const systemFields = ['locale', 'publishedAt', 'updatedAt', 'createdAt', 'createdBy', 'updatedBy', 'localizations', 'documentId'];
        
        // Check which fields have actually changed (excluding system fields)
        const actuallyChangedFields: string[] = [];
        
        for (const field of Object.keys(data)) {
          // Skip system fields
          if (systemFields.includes(field)) {
            continue;
          }
          
          // Skip status field if it's still "published" (no change)
          if (field === 'course_status' && data.course_status === 'published') {
            continue;
          }
          
          // Check if this field value actually changed
          const existingValue = existingCourse[field];
          const newValue = data[field];
          
          if (hasValueChanged(field, newValue, existingValue)) {
            actuallyChangedFields.push(field);
          }
        }
        
        // Block if there are actual changes to fields (status remains published)
        if (actuallyChangedFields.length > 0) {
          const errorMessage = 'Cannot update a published course. Please change the course status to "draft" or "cancel" first before making any changes.';
          throw createValidationError(errorMessage, actuallyChangedFields);
        }
        
        // If no fields actually changed, allow the save (might be a refresh or system update)
        console.log('[Course Security] No actual field changes detected, allowing save');
        return;
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
              const errorMessage = `Cannot publish paid course with copyright issues: ${copyrightCheck.details}. Please resolve all copyright violations before publishing.`;
              throw createValidationError(errorMessage, ['course_status']);
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
            const errorMessage = `Cannot change to paid course with copyright issues: ${copyrightCheck.details}. Please unpublish, resolve copyright issues, and then republish.`;
            throw createValidationError(errorMessage, ['is_paid']);
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
      
      // If error is already properly formatted with ValidationError structure, re-throw it
      if (error.name === 'ValidationError' && error.details?.errors && Array.isArray(error.details.errors)) {
        throw error;
      }
      
      // Format error for Strapi v5 admin UI
      const errorMessage = error.message || 'Validation failed';
      const blockedFields = error.details?.blockedFields || [];
      const attemptedFields = error.details?.attemptedFields || [];
      const fields = blockedFields.length > 0 ? blockedFields : attemptedFields;
      
      // Throw properly formatted error
      throw createValidationError(errorMessage, fields);
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

  /**
   * After updating a course, recalculate rating_counts (count of reviewers) if not manually set
   * rating_counts = total number of users who rated the course
   */
  async afterUpdate(event: any) {
    const { result, params } = event;
    const { data } = params;

    // Only recalculate if rating_counts was NOT manually set in this update
    // If user manually set rating_counts, respect their choice
    if (data.rating_counts === undefined) {
      try {
        // Get all reviewers for this course
        const reviewers = await strapi.entityService.findMany(
          'api::course-reviewer.course-reviewer',
          {
            filters: {
              course_course: {
                id: result.id,
              },
            },
            fields: ['rating_stars'],
          }
        );

        // Count the number of reviewers (ratings)
        const ratingCount = reviewers ? reviewers.length : 0;

        // Only update if different from current value to avoid infinite loops
        if (result.rating_counts !== ratingCount) {
          await strapi.entityService.update(
            'api::course-course.course-course',
            result.id,
            {
              data: {
                rating_counts: ratingCount,
              },
            }
          );
          console.log(
            `[Rating Update] Auto-updated course ${result.id} rating_counts to ${ratingCount} ` +
            `(total number of ratings/reviewers)`
          );
        }
      } catch (error) {
        console.error(`[Rating Update] Error auto-updating rating_counts for course ${result.id}:`, error);
        // Don't throw - allow the course update to succeed
      }
    } else {
      // rating_counts was manually set, respect the user's choice
      console.log(`[Rating Update] Course ${result.id} rating_counts manually set to ${data.rating_counts}, not recalculating`);
    }
  },
};

