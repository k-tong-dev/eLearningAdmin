/**
 * Lifecycle hooks for course-enrollment content type
 * Auto-update enrollment_count on course-course when enrollments are created/updated/deleted
 * Auto-set started_at and completed_at dates
 */

/**
 * Update the enrollment_count field on a course
 * This counts all active enrollments for the course
 */
async function updateCourseEnrollmentCount(strapi: any, courseId: string | number) {
  try {
    // Get all active enrollments for this course
    const enrollments = await strapi.entityService.findMany(
      'api::course-enrollment.course-enrollment',
      {
        filters: {
          course_course: {
            id: courseId,
          },
          enroll_status: {
            $in: ['active', 'completed'], // Count active and completed enrollments
          },
        },
        fields: ['id'],
      }
    );

    // Count the number of enrollments
    const enrollmentCount = enrollments ? enrollments.length : 0;

    // Update the course enrollment_count field
    await strapi.entityService.update(
      'api::course-course.course-course',
      courseId,
      {
        data: {
          enrollment_count: enrollmentCount,
        },
      }
    );

    console.log(
      `[Enrollment Count] Updated course ${courseId} enrollment_count to ${enrollmentCount} ` +
      `(total active/completed enrollments)`
    );
  } catch (error) {
    console.error(`[Enrollment Count] Error updating enrollment_count for course ${courseId}:`, error);
    // Don't throw - allow the enrollment operation to succeed even if count update fails
  }
}

/**
 * Get course ID from enrollment result (handles both object and ID formats)
 */
function getCourseIdFromEnrollment(enrollment: any): string | number | null {
  if (!enrollment || !enrollment.course_course) {
    return null;
  }

  if (typeof enrollment.course_course === 'object') {
    return enrollment.course_course.id || enrollment.course_course.documentId || null;
  }

  return enrollment.course_course;
}

export default {
  /**
   * Before creating an enrollment, set started_at if not provided
   */
  async beforeCreate(event: any) {
    const { data } = event.params;

    // Auto-set started_at if not provided
    if (!data.started_at) {
      data.started_at = new Date().toISOString();
      console.log(`[Enrollment] Auto-set started_at for new enrollment`);
    }
  },

  /**
   * After creating an enrollment, update the course enrollment_count
   */
  async afterCreate(event: any) {
    const { result } = event;
    
    const courseId = getCourseIdFromEnrollment(result);
    if (courseId) {
      await updateCourseEnrollmentCount(strapi, courseId);
    }
  },

  /**
   * Before updating an enrollment, handle status changes and dates
   */
  async beforeUpdate(event: any) {
    const { data, where } = event.params;

    // Get existing enrollment to check current status
    const identifier = where.documentId || where.id;
    if (!identifier) {
      return; // Let Strapi handle the error
    }

    const isNumericId = typeof identifier === 'number' || (typeof identifier === 'string' && /^\d+$/.test(identifier));
    const whereClause = isNumericId ? { id: identifier } : { documentId: identifier };

    try {
      const existingEnrollment: any = await strapi.db.query('api::course-enrollment.course-enrollment').findOne({
        where: whereClause,
      });

      if (!existingEnrollment) {
        return; // Let Strapi handle the error
      }

      // Auto-set completed_at when status changes to "completed"
      if (data.enroll_status === 'completed' && existingEnrollment.enroll_status !== 'completed') {
        if (!data.completed_at) {
          data.completed_at = new Date().toISOString();
          console.log(`[Enrollment] Auto-set completed_at for enrollment ${identifier}`);
        }
      }

      // Clear completed_at if status changes from "completed" to something else
      if (data.enroll_status && 
          data.enroll_status !== 'completed' && 
          existingEnrollment.enroll_status === 'completed') {
        data.completed_at = null;
        console.log(`[Enrollment] Cleared completed_at for enrollment ${identifier} (status changed from completed)`);
      }

      // Ensure started_at is set if enrollment is being activated
      if (data.enroll_status === 'active' && !existingEnrollment.started_at && !data.started_at) {
        data.started_at = new Date().toISOString();
        console.log(`[Enrollment] Auto-set started_at for enrollment ${identifier} (being activated)`);
      }
    } catch (error) {
      console.error(`[Enrollment] Error in beforeUpdate hook:`, error);
      // Don't throw - allow the update to proceed
    }
  },

  /**
   * After updating an enrollment, update the course enrollment_count
   * (in case status changed from active to cancelled/refunded or vice versa)
   */
  async afterUpdate(event: any) {
    const { result } = event;
    
    const courseId = getCourseIdFromEnrollment(result);
    if (courseId) {
      await updateCourseEnrollmentCount(strapi, courseId);
    }
  },

  /**
   * After deleting an enrollment, update the course enrollment_count
   */
  async afterDelete(event: any) {
    const { result } = event;
    
    const courseId = getCourseIdFromEnrollment(result);
    if (courseId) {
      await updateCourseEnrollmentCount(strapi, courseId);
    }
  },
};
