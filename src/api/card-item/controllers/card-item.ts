/**
 * card-item controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::card-item.card-item' as any, ({ strapi }: any) => ({
  /**
   * Get current user's card items
   */
  async me(ctx: any) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    try {
      const cardItems: any = await strapi.db.query('api::card-item.card-item').findMany({
        where: {
          user: {
            id: user.id,
          },
        },
        populate: {
          course: {
            fields: ['id', 'documentId', 'name', 'description', 'Price'],
            populate: {
              course_preview: {
                fields: ['id', 'documentId', 'types', 'url'],
                populate: {
                  image: true,
                  video: true,
                },
              },
              instructors: {
                fields: ['id', 'name'],
                populate: {
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy: { added_at: 'desc' },
      });

      console.log('\n========================================');
      console.log('[Card Item] Fetched Card items:', cardItems.length);
      console.log('========================================\n');
      
      if (cardItems.length > 0) {
        cardItems.forEach((item: any, index: number) => {
          console.log(`\n---------- Item ${index + 1} ----------`);
          console.log('Cart Item ID:', item.id);
          console.log('Cart Item DocumentId:', item.documentId);
          console.log('Course Object:', {
            id: item.course?.id,
            documentId: item.course?.documentId,
            name: item.course?.name,
            Price: item.course?.Price
          });
          console.log('Course Full JSON:', JSON.stringify(item.course, null, 2));
          console.log('----------------------------------\n');
        });
      }
      
      return { data: cardItems };
    } catch (error) {
      strapi.log.error('[Card Item] Error fetching user card:', error);
      return ctx.internalServerError('Failed to fetch card items');
    }
  },

  /**
   * Add item to card (or update quantity if exists)
   */
  async addToCard(ctx: any) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    const { courseId, quantity = 1 } = ctx.request.body;

    if (!courseId) {
      return ctx.badRequest('Course ID is required');
    }

    try {
      // Fetch course with both id and documentId
      const course: any = await strapi.entityService.findOne('api::course-course.course-course' as any, courseId, {
        fields: ['id', 'documentId', 'Price'],
      });

      if (!course) {
        return ctx.notFound('Course not found');
      }

      strapi.log.info('[Card Item] Course data:', {
        numericId: course.id,
        documentId: course.documentId,
        price: course.Price
      });

      // Check if item already exists in card using numeric ID
      const existing: any = await strapi.db.query('api::card-item.card-item').findMany({
        where: {
          user: {
            id: user.id,
          },
          course: {
            id: course.id,
          },
        },
      });

      if (existing && Array.isArray(existing) && existing.length > 0) {
        // Update quantity
        await strapi.db.query('api::card-item.card-item').update({
          where: { id: existing[0].id },
          data: {
            quantity: existing[0].quantity + quantity,
          },
        });

        // Fetch with full populate
        const updated = await strapi.db.query('api::card-item.card-item').findOne({
          where: { id: existing[0].id },
          populate: {
            course: {
              fields: ['id', 'documentId', 'name', 'description', 'Price'],
              populate: {
                course_preview: {
                  fields: ['id', 'documentId', 'types', 'url'],
                  populate: {
                    image: true,
                    video: true,
                  },
                },
                instructors: {
                  fields: ['id', 'name'],
                  populate: {
                    avatar: true,
                  },
                },
              },
            },
          },
        });

        strapi.log.info('[Card Item] Updated existing item - Course ID:', updated?.course?.id);
        return { data: updated, message: 'Card item updated' };
      } else {
        // Create new card item with proper relation connection using documentId for connect
        // Strapi v5 connect API prefers documentId for relations
        const newItem = await strapi.entityService.create('api::card-item.card-item' as any, {
          data: {
            quantity,
            price_at_add: course.Price || 0,
            added_at: new Date(),
            user: {
              connect: [user.id], // User uses numeric ID (from users-permissions plugin)
            },
            course: {
              connect: [course.documentId], // ✅ Use documentId for Strapi v5 content types
            },
          },
        });

        strapi.log.info('[Card Item] Created Card item with:', {
          userId: user.id,
          courseDocumentId: course.documentId,
          courseNumericId: course.id,
        });

        // Fetch with full populate
        const populated = await strapi.db.query('api::card-item.card-item').findOne({
          where: { id: newItem.id },
          populate: {
            course: {
              fields: ['id', 'documentId', 'name', 'description', 'Price'],
              populate: {
                course_preview: {
                  fields: ['id', 'documentId', 'types', 'url'],
                  populate: {
                    image: true,
                    video: true,
                  },
                },
                instructors: {
                  fields: ['id', 'name'],
                  populate: {
                    avatar: true,
                  },
                },
              },
            },
          },
        });

        strapi.log.info('[Card Item] Populated result:', {
          hasCourse: !!populated?.course,
          courseId: populated?.course?.id,
          courseDocumentId: populated?.course?.documentId,
        });

        return { data: populated, message: 'Item added to card' };
      }
    } catch (error) {
      strapi.log.error('[Card Item] Error adding to card:', error);
      return ctx.internalServerError('Failed to add item to card');
    }
  },

  /**
   * Remove item from card
   */
  async removeFromCard(ctx: any) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    try {
      // Verify ownership
      const cardItem: any = await strapi.entityService.findOne('api::card-item.card-item' as any, id, {
        populate: {
          user: {
            fields: ['id'],
          },
        },
      });

      if (!cardItem || cardItem.user?.id !== user.id) {
        return ctx.forbidden('You can only remove your own card items');
      }

      await strapi.entityService.delete('api::card-item.card-item' as any, id);

      return { message: 'Item removed from card' };
    } catch (error) {
      strapi.log.error('[Card Item] Error removing from card:', error);
      return ctx.internalServerError('Failed to remove item from card');
    }
  },

  /**
   * Clear all card items for current user
   */
  async clearCard(ctx: any) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    try {
      const cardItems: any = await strapi.entityService.findMany('api::card-item.card-item' as any, {
        filters: {
          user: {
            id: user.id,
          },
        },
        fields: ['id'],
      });

      // Delete all items
      if (Array.isArray(cardItems)) {
        for (const item of cardItems) {
          await strapi.entityService.delete('api::card-item.card-item' as any, item.id);
        }
        return { message: `Cleared ${cardItems.length} items from card` };
      }
      
      return { message: 'Card is empty' };
    } catch (error) {
      strapi.log.error('[Card Item] Error clearing card:', error);
      return ctx.internalServerError('Failed to clear card');
    }
  },
}));
