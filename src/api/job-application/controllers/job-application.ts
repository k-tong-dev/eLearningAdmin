/**
 * job-application controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::job-application.job-application' as any, ({ strapi }) => ({
  async create(ctx: any) {
    try {
      const { data } = ctx.request.body;

      // Create the application
      const application = await strapi.entityService.create('api::job-application.job-application' as any, {
        data: {
          ...data,
          applyStatus: data.applyStatus || 'new', // Use provided applyStatus or default to 'new'
        },
        populate: {
          job: {
            fields: ['title'],
          },
          resume: true,
        },
      });

      // Get job title for email
      let jobTitle = 'N/A';
      if (data.job) {
        const job: any = await strapi.entityService.findOne('api::job.job' as any, data.job, {
          fields: ['title'],
        });
        if (job) jobTitle = job.title;
      }

      // Send email notifications (optional - requires email plugin configuration)
      try {
        if (strapi.plugins.email) {
          // Notification 1: To job poster/HR
          const hrEmail = process.env.HR_EMAIL || 'hr@example.com';
          await strapi.plugins.email.services.email.send({
            to: hrEmail,
            subject: `New Job Application: ${data.fullName} - ${jobTitle}`,
            text: `
              New job application received:
              
              Applicant: ${data.fullName}
              Email: ${data.email}
              Phone: ${data.phone || 'N/A'}
              Job: ${jobTitle}
              Status: ${application.applyStatus || 'new'}
              
              Please review in Strapi admin panel.
            `,
            html: `
              <h2>New Job Application Received</h2>
              <p><strong>Applicant:</strong> ${data.fullName}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
              <p><strong>Job:</strong> ${jobTitle}</p>
              <p><strong>Status:</strong> ${application.applyStatus || 'new'}</p>
              <p>Please review in Strapi admin panel.</p>
            `,
          });

          // Notification 2: To job applicant (confirmation)
          await strapi.plugins.email.services.email.send({
            to: data.email,
            subject: `Application Received: ${jobTitle}`,
            text: `
              Thank you for your interest in the ${jobTitle} position.
              
              We have received your application and will review it shortly.
              We'll get back to you soon with an update.
              
              Application Status: ${application.applyStatus || 'new'}
              
              Best regards,
              HR Team
            `,
            html: `
              <h2>Application Received</h2>
              <p>Thank you for your interest in the <strong>${jobTitle}</strong> position.</p>
              <p>We have received your application and will review it shortly. We'll get back to you soon with an update.</p>
              <p><strong>Application Status:</strong> ${application.applyStatus || 'new'}</p>
              <p>Best regards,<br>HR Team</p>
            `,
          });

          strapi.log.info(`Notifications sent for application from ${data.fullName}`);
        }
      } catch (emailError) {
        // Log error but don't fail the request
        strapi.log.warn('Failed to send email notifications:', emailError);
      }

      return ctx.created({ data: application });
    } catch (error: any) {
      strapi.log.error('Error creating job application:', error);
      return ctx.badRequest(error.message);
    }
  },
}));

