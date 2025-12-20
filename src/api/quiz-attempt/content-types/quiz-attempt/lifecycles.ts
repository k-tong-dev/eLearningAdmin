/**
 * Lifecycle hooks for quiz-attempt content type
 * Ensures cascading delete: when a quiz-attempt is deleted, all related quiz-attempt-answers are also deleted
 */

export default {
  /**
   * Before deleting a quiz-attempt, delete all related quiz-attempt-answers
   */
  async beforeDelete(event: any) {
    const { where } = event.params;
    
    try {
      // Get the quiz-attempt ID (handle both documentId and id)
      const identifier = where.documentId || where.id;
      
      if (!identifier) {
        strapi.log.warn('[Quiz Attempt Lifecycle] No identifier found for deletion');
        return;
      }

      // Determine if we have a documentId (string) or numeric id
      const isNumericId = typeof identifier === 'number' || (typeof identifier === 'string' && /^\d+$/.test(identifier));
      
      // Find all quiz-attempt-answers related to this quiz-attempt
      // In Strapi v5, we query by the relationship field using nested object structure
      const relatedAnswers = await strapi.db.query('api::quiz-attempt-answer.quiz-attempt-answer').findMany({
        where: {
          quiz_attempt: isNumericId ? { id: identifier } : { documentId: identifier },
        },
      });

      if (relatedAnswers && relatedAnswers.length > 0) {
        strapi.log.info(
          `[Quiz Attempt Lifecycle] Found ${relatedAnswers.length} related quiz-attempt-answers to delete for quiz-attempt ${identifier}`
        );

        // Delete all related quiz-attempt-answers
        for (const answer of relatedAnswers) {
          const answerId = answer.documentId || answer.id;
          const answerWhereClause = answer.documentId 
            ? { documentId: answerId } 
            : { id: answerId };

          try {
            await strapi.db.query('api::quiz-attempt-answer.quiz-attempt-answer').delete({
              where: answerWhereClause,
            });
            strapi.log.debug(
              `[Quiz Attempt Lifecycle] Deleted quiz-attempt-answer ${answerId}`
            );
          } catch (error) {
            strapi.log.error(
              `[Quiz Attempt Lifecycle] Error deleting quiz-attempt-answer ${answerId}:`,
              error
            );
            // Continue deleting other answers even if one fails
          }
        }

        strapi.log.info(
          `[Quiz Attempt Lifecycle] Successfully deleted ${relatedAnswers.length} related quiz-attempt-answers`
        );
      } else {
        strapi.log.debug(
          `[Quiz Attempt Lifecycle] No related quiz-attempt-answers found for quiz-attempt ${identifier}`
        );
      }
    } catch (error) {
      strapi.log.error(
        '[Quiz Attempt Lifecycle] Error in beforeDelete hook:',
        error
      );
      // Don't throw - allow the deletion to proceed even if cleanup fails
      // This prevents blocking the deletion if there's an issue with the cleanup
    }
  },
};

