/**
 * job-application lifecycles
 * Ensures applyStatus field is always valid and never empty
 * Sends notifications when status changes
 * Note: Renamed from "status" to "applyStatus" to avoid conflict with Strapi's internal status
 */

export default {
  beforeCreate(event: any) {
    const { data } = event.params;

    // Ensure applyStatus is always set and valid
    if (!data.applyStatus || data.applyStatus === null || data.applyStatus === undefined) {
      // applyStatus is missing - set default to 'new'
      data.applyStatus = 'new';
    } else {
      // applyStatus exists - normalize it
      const statusValue = String(data.applyStatus).trim().toLowerCase();

      // Validate applyStatus is one of the allowed enum values
      if (['new', 'review', 'shortlisted', 'rejected', 'hired'].includes(statusValue)) {
        data.applyStatus = statusValue;
      } else {
        // Invalid applyStatus - set to default
        strapi.log.warn(`[Job Application Lifecycle] Invalid applyStatus "${data.applyStatus}", defaulting to "new"`);
        data.applyStatus = 'new';
      }
    }
  },

  beforeUpdate(event: any) {
    const { data, where } = event.params;

    // Handle applyStatus field - only process if applyStatus is being updated
    if (data.applyStatus !== undefined) {
      if (data.applyStatus === null || data.applyStatus === '') {
        // applyStatus is being cleared - set to default
        strapi.log.warn(`[Job Application Lifecycle] applyStatus was cleared, setting to "new"`);
        data.applyStatus = 'new';
      } else {
        // applyStatus is being updated - normalize and validate it
        const statusValue = String(data.applyStatus).trim().toLowerCase();

        // Validate applyStatus is one of the allowed enum values
        if (['new', 'review', 'shortlisted', 'rejected', 'hired'].includes(statusValue)) {
          data.applyStatus = statusValue;
        } else {
          // Invalid applyStatus - remove from update data so Strapi keeps existing value
          strapi.log.warn(`[Job Application Lifecycle] Invalid applyStatus "${data.applyStatus}" in update, keeping existing value`);
          delete data.applyStatus;
        }
      }
    }
  },

  afterUpdate(event: any) {
    // Send notification when status changes
    const { result } = event;
    const newStatus = result?.applyStatus || result?.attributes?.applyStatus;
    
    if (newStatus && strapi.plugins.email) {
      // Get the application with job details
      strapi.entityService.findOne('api::job-application.job-application', result.id, {
        populate: ['job'],
      }).then((application: any) => {
        if (application && application.email) {
          const jobTitle = application.job?.title || 'the position';
          const statusMessages: Record<string, { subject: string; message: string }> = {
            review: {
              subject: `Application Under Review: ${jobTitle}`,
              message: `Your application for ${jobTitle} is now under review. We'll get back to you soon.`,
            },
            shortlisted: {
              subject: `Congratulations! You've been shortlisted for ${jobTitle}`,
              message: `Great news! Your application for ${jobTitle} has been shortlisted. We'll contact you soon for the next steps.`,
            },
            rejected: {
              subject: `Update on your application for ${jobTitle}`,
              message: `Thank you for your interest in ${jobTitle}. Unfortunately, we've decided to move forward with other candidates. We wish you the best in your job search.`,
            },
            hired: {
              subject: `Congratulations! You've been selected for ${jobTitle}`,
              message: `Congratulations! We're excited to offer you the ${jobTitle} position. We'll contact you soon with details.`,
            },
          };

          const notification = statusMessages[newStatus];
          if (notification) {
            strapi.plugins.email.services.email.send({
              to: application.email,
              subject: notification.subject,
              text: notification.message,
              html: `<p>${notification.message}</p>`,
            }).catch((error: any) => {
              strapi.log.warn('Failed to send status update notification:', error);
            });
          }
        }
      }).catch((error: any) => {
        strapi.log.warn('Failed to fetch application for notification:', error);
      });
    }
  },
};
