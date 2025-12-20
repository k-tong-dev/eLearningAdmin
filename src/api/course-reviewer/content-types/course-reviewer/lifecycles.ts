/**
 * Lifecycle hooks for course-reviewer content type
 * Auto-calculate and update rating_counts on course-course when reviewers are added/updated/deleted
 */

/**
 * Count the number of ratings (reviewers) for a course and update rating_counts
 * rating_counts = total number of users who rated the course (1-5 stars)
 */
async function updateCourseRatingCounts(strapi: any, courseId: string | number) {
  try {
    // Get all reviewers for this course
    const reviewers = await strapi.entityService.findMany(
      'api::course-reviewer.course-reviewer',
      {
        filters: {
          course_course: {
            id: courseId,
          },
        },
        fields: ['rating_stars'],
      }
    );

    // Count the number of reviewers (ratings)
    const ratingCount = reviewers ? reviewers.length : 0;

    // Update the course rating_counts with the count
    await strapi.entityService.update(
      'api::course-course.course-course',
      courseId,
      {
        data: {
          rating_counts: ratingCount,
        },
      }
    );

    console.log(
      `[Rating Update] Updated course ${courseId} rating_counts to ${ratingCount} ` +
      `(total number of ratings/reviewers)`
    );
  } catch (error) {
    console.error(`[Rating Update] Error updating rating_counts for course ${courseId}:`, error);
    // Don't throw - allow the reviewer operation to succeed even if rating update fails
  }
}

export default {
  /**
   * After creating a new reviewer, update the course rating
   */
  async afterCreate(event: any) {
    const { result } = event;
    
    if (result.course_course) {
      const courseId = typeof result.course_course === 'object' 
        ? (result.course_course.id || result.course_course.documentId)
        : result.course_course;
      
      if (courseId) {
        await updateCourseRatingCounts(strapi, courseId);
      }
    }
  },

  /**
   * After updating a reviewer, update the course rating
   */
  async afterUpdate(event: any) {
    const { result } = event;
    
    if (result.course_course) {
      const courseId = typeof result.course_course === 'object' 
        ? (result.course_course.id || result.course_course.documentId)
        : result.course_course;
      
      if (courseId) {
        await updateCourseRatingCounts(strapi, courseId);
      }
    }
  },

  /**
   * After deleting a reviewer, update the course rating
   */
  async afterDelete(event: any) {
    const { result } = event;
    
    if (result.course_course) {
      const courseId = typeof result.course_course === 'object' 
        ? (result.course_course.id || result.course_course.documentId)
        : result.course_course;
      
      if (courseId) {
        await updateCourseRatingCounts(strapi, courseId);
      }
    }
  },
};

