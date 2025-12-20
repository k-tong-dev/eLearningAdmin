# Career Module Setup Guide

This guide will help you set up the Career module for your eLearning platform.

## Prerequisites

- Strapi v5 running and accessible
- Next.js application configured
- Database connection established

## Step 1: Strapi Content Types

The following content types have been created:

1. **Department** (`api::department.department`)
2. **Job** (`api::job.job`)
3. **Job Application** (`api::job-application.job-application`)

## Step 2: Configure Strapi Permissions

### Public Permissions (for viewing jobs)

1. Go to Strapi Admin Panel → Settings → Users & Permissions Plugin → Roles → Public
2. Enable the following permissions:
   - **Job**: `find`, `findOne`
   - **Department**: `find`, `findOne`

### Authenticated Permissions (optional, for logged-in users)

1. Go to Settings → Users & Permissions Plugin → Roles → Authenticated
2. Enable the same permissions as Public (if you want logged-in users to have the same access)

### Admin Permissions

Admin users automatically have full access to all content types.

## Step 3: Job Application Permissions

1. Go to Settings → Users & Permissions Plugin → Roles → Public
2. Enable for **Job Application**:
   - `create` (so users can submit applications)

3. **Important**: Do NOT enable `find`, `findOne`, `update`, or `delete` for Public role
   - This ensures only admins can view applications

## Step 4: Create Sample Data

### Create Departments

1. Go to Content Manager → Department
2. Create departments like:
   - Engineering
   - Marketing
   - Sales
   - Operations
   - HR

### Create Jobs

1. Go to Content Manager → Job
2. Create a job with:
   - Title: "Senior Full-Stack Developer"
   - Slug: (auto-generated)
   - Description: (rich text)
   - Department: Select a department
   - Location: "Remote" or "New York, NY"
   - Job Type: Select from dropdown
   - Salary Min/Max: (optional)
   - Status: Set to "open"
3. Click "Publish"

## Step 5: Environment Variables

Make sure your Next.js app has:

```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
HR_EMAIL=hr@example.com  # For email notifications (optional)
```

## Step 6: Email Notifications (Optional)

To enable email notifications when applications are submitted:

1. Configure Strapi email plugin in `config/plugins.ts`
2. Set `HR_EMAIL` environment variable
3. The email will be sent automatically when an application is created

## Step 7: Test the Module

1. Start Strapi: `pnpm run develop`
2. Start Next.js: `pnpm run dev`
3. Visit:
   - Landing page: `http://localhost:3000/career`
   - Jobs listing: `http://localhost:3000/career/jobs`
   - Job detail: `http://localhost:3000/career/jobs/[job-slug]`

## API Endpoints

### Public Endpoints

- `GET /api/jobs` - List all open jobs
- `GET /api/jobs?filters[slug][$eq]=job-slug` - Get job by slug
- `GET /api/departments` - List all departments
- `POST /api/job-applications` - Submit job application

### Admin Endpoints (require authentication)

- `GET /api/job-applications` - List all applications
- `GET /api/job-applications/:id` - Get application details
- `PUT /api/job-applications/:id` - Update application status
- `DELETE /api/job-applications/:id` - Delete application

## Troubleshooting

### Jobs not showing

- Check that jobs have `status = "open"`
- Verify jobs are published
- Check Strapi permissions for Public role

### Application submission fails

- Check file size (max 5MB)
- Verify file type (PDF, DOC, DOCX only)
- Check Strapi permissions for Job Application create

### Email notifications not working

- Verify email plugin is configured
- Check `HR_EMAIL` environment variable
- Check Strapi logs for email errors

## Next Steps

1. Customize the UI components in `components/career/`
2. Add more filters or search options
3. Implement application status tracking for applicants
4. Add analytics tracking
5. Set up automated email responses

