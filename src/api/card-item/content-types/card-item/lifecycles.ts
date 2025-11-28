/**
 * Lifecycle callbacks for card-item
 * Auto-populate price_at_add from course Price
 */

export default {
  async beforeCreate(event: any) {
    const { data } = event.params;

    // If price_at_add is not set and course is provided, fetch course price
    if (data.course && (data.price_at_add === undefined || data.price_at_add === null)) {
      try {
        const course = await strapi.entityService.findOne(
          'api::course-course.course-course' as any,
          data.course,
          {
            fields: ['Price'],
          }
        );

        if (course && course.Price !== undefined) {
          data.price_at_add = course.Price;
        } else {
          data.price_at_add = 0;
        }
      } catch (error) {
        strapi.log.error('[Card Item Lifecycle] Error fetching course price:', error);
        data.price_at_add = 0;
      }
    }
  },

  async beforeUpdate(event: any) {
    const { data } = event.params;

    // If course is being changed or removed, update price_at_add
    if (data.course !== undefined) {
      if (data.course === null) {
        data.price_at_add = 0;
      } else {
        try {
          const course = await strapi.entityService.findOne(
            'api::course-course.course-course' as any,
            data.course,
            {
              fields: ['Price'],
            }
          );

          if (course && course.Price !== undefined) {
            data.price_at_add = course.Price;
          }
        } catch (error) {
          strapi.log.error('[Card Item Lifecycle] Error fetching course price on update:', error);
        }
      }
    }
  },
};

