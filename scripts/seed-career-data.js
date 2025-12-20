'use strict';

const { createStrapi, compileStrapi } = require('@strapi/strapi');

const departments = [
  { name: 'Engineering', description: 'Software development and technical innovation' },
  { name: 'Marketing', description: 'Brand promotion and customer engagement' },
  { name: 'Sales', description: 'Business development and client relations' },
  { name: 'Operations', description: 'Business operations and process management' },
  { name: 'Human Resources', description: 'Talent acquisition and employee development' },
  { name: 'Product', description: 'Product management and strategy' },
];

const jobs = [
  {
    title: 'Senior Full-Stack Developer',
    description: `
      <h2>About the Role</h2>
      <p>We are looking for an experienced Full-Stack Developer to join our engineering team. You will be responsible for developing and maintaining web applications using modern technologies.</p>
      
      <h3>Responsibilities</h3>
      <ul>
        <li>Design and develop scalable web applications</li>
        <li>Collaborate with cross-functional teams</li>
        <li>Write clean, maintainable code</li>
        <li>Participate in code reviews</li>
        <li>Mentor junior developers</li>
      </ul>
      
      <h3>Requirements</h3>
      <ul>
        <li>5+ years of experience in full-stack development</li>
        <li>Proficiency in React, Node.js, and TypeScript</li>
        <li>Experience with databases (PostgreSQL, MongoDB)</li>
        <li>Strong problem-solving skills</li>
        <li>Excellent communication skills</li>
      </ul>
    `,
    location: 'Remote',
    jobType: 'full-time',
    salaryMin: 80000,
    salaryMax: 120000,
    department: 'Engineering',
  },
  {
    title: 'Marketing Manager',
    description: `
      <h2>About the Role</h2>
      <p>We are seeking a creative Marketing Manager to lead our marketing initiatives and drive brand awareness.</p>
      
      <h3>Responsibilities</h3>
      <ul>
        <li>Develop and execute marketing strategies</li>
        <li>Manage marketing campaigns across multiple channels</li>
        <li>Analyze market trends and competitor activities</li>
        <li>Collaborate with sales and product teams</li>
        <li>Manage marketing budget</li>
      </ul>
      
      <h3>Requirements</h3>
      <ul>
        <li>3+ years of marketing experience</li>
        <li>Strong analytical skills</li>
        <li>Experience with digital marketing tools</li>
        <li>Excellent written and verbal communication</li>
      </ul>
    `,
    location: 'New York, NY',
    jobType: 'full-time',
    salaryMin: 60000,
    salaryMax: 90000,
    department: 'Marketing',
  },
  {
    title: 'Sales Representative',
    description: `
      <h2>About the Role</h2>
      <p>Join our sales team as a Sales Representative and help grow our business by connecting with potential clients.</p>
      
      <h3>Responsibilities</h3>
      <ul>
        <li>Identify and pursue new business opportunities</li>
        <li>Build and maintain client relationships</li>
        <li>Present products and services to clients</li>
        <li>Meet sales targets</li>
        <li>Provide excellent customer service</li>
      </ul>
      
      <h3>Requirements</h3>
      <ul>
        <li>2+ years of sales experience</li>
        <li>Strong interpersonal skills</li>
        <li>Goal-oriented mindset</li>
        <li>Ability to work independently</li>
      </ul>
    `,
    location: 'San Francisco, CA',
    jobType: 'full-time',
    salaryMin: 50000,
    salaryMax: 80000,
    department: 'Sales',
  },
  {
    title: 'Product Designer Intern',
    description: `
      <h2>About the Role</h2>
      <p>We're offering an exciting internship opportunity for aspiring Product Designers to learn and contribute to our design team.</p>
      
      <h3>Responsibilities</h3>
      <ul>
        <li>Assist in creating user interface designs</li>
        <li>Participate in user research activities</li>
        <li>Create design mockups and prototypes</li>
        <li>Collaborate with product and engineering teams</li>
      </ul>
      
      <h3>Requirements</h3>
      <ul>
        <li>Currently pursuing a degree in Design or related field</li>
        <li>Portfolio demonstrating design skills</li>
        <li>Familiarity with design tools (Figma, Adobe Creative Suite)</li>
        <li>Strong attention to detail</li>
      </ul>
    `,
    location: 'Remote',
    jobType: 'internship',
    department: 'Product',
  },
  {
    title: 'DevOps Engineer',
    description: `
      <h2>About the Role</h2>
      <p>We are looking for a DevOps Engineer to help maintain and improve our infrastructure and deployment processes.</p>
      
      <h3>Responsibilities</h3>
      <ul>
        <li>Manage cloud infrastructure (AWS/Azure/GCP)</li>
        <li>Automate deployment processes</li>
        <li>Monitor system performance</li>
        <li>Implement CI/CD pipelines</li>
        <li>Ensure system security</li>
      </ul>
      
      <h3>Requirements</h3>
      <ul>
        <li>3+ years of DevOps experience</li>
        <li>Experience with Docker and Kubernetes</li>
        <li>Knowledge of cloud platforms</li>
        <li>Scripting skills (Bash, Python)</li>
      </ul>
    `,
    location: 'Remote',
    jobType: 'full-time',
    salaryMin: 90000,
    salaryMax: 130000,
    department: 'Engineering',
  },
  {
    title: 'HR Coordinator',
    description: `
      <h2>About the Role</h2>
      <p>Join our HR team as a Coordinator to support various human resources functions and help create a great workplace.</p>
      
      <h3>Responsibilities</h3>
      <ul>
        <li>Assist in recruitment and onboarding</li>
        <li>Maintain employee records</li>
        <li>Coordinate training programs</li>
        <li>Support employee engagement initiatives</li>
        <li>Handle HR administrative tasks</li>
      </ul>
      
      <h3>Requirements</h3>
      <ul>
        <li>1+ years of HR experience</li>
        <li>Strong organizational skills</li>
        <li>Excellent communication skills</li>
        <li>Attention to detail</li>
      </ul>
    `,
    location: 'Chicago, IL',
    jobType: 'full-time',
    salaryMin: 45000,
    salaryMax: 60000,
    department: 'Human Resources',
  },
];

async function seedCareerData() {
  try {
    console.log('Loading Strapi...');
    const appContext = await compileStrapi();
    const app = await createStrapi(appContext).load();

    console.log('\n=== Seeding Career Module Data ===\n');

    // Create Departments
    console.log('Creating Departments...\n');
    const departmentMap = {};

    for (const deptData of departments) {
      // Check if department already exists
      const existing = await app.db.query('api::department.department').findOne({
        where: { name: deptData.name },
      });

      if (existing) {
        console.log(`✓ Department "${deptData.name}" already exists`);
        departmentMap[deptData.name] = existing.documentId || existing.id;
      } else {
        const department = await app.entityService.create('api::department.department', {
          data: {
            name: deptData.name,
            description: deptData.description,
          },
        });
        await app.entityService.update('api::department.department', department.id, {
          data: { publishedAt: new Date() },
        });
        console.log(`✓ Created department: ${deptData.name}`);
        departmentMap[deptData.name] = department.documentId || department.id;
      }
    }

    // Create Jobs
    console.log('\nCreating Jobs...\n');

    for (const jobData of jobs) {
      // Check if job already exists
      const existing = await app.db.query('api::job.job').findOne({
        where: { title: jobData.title },
      });

      if (existing) {
        console.log(`✓ Job "${jobData.title}" already exists`);
      } else {
        const departmentId = departmentMap[jobData.department];
        
        // Generate slug from title
        const slug = jobData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        const jobDataToCreate = {
          title: jobData.title,
          slug: slug,
          description: jobData.description.trim(),
          location: jobData.location,
          jobType: jobData.jobType,
          salaryMin: jobData.salaryMin,
          salaryMax: jobData.salaryMax,
          status: 'open',
          metaTitle: `${jobData.title} - Careers`,
          metaDescription: `Apply for ${jobData.title} position at ${jobData.location}`,
        };

        // Add department relation if exists
        if (departmentId) {
          jobDataToCreate.department = { connect: [departmentId] };
        }
        
        const job = await app.entityService.create('api::job.job', {
          data: jobDataToCreate,
        });

        // Publish the job
        await app.entityService.update('api::job.job', job.id, {
          data: { publishedAt: new Date() },
        });

        console.log(`✓ Created job: ${jobData.title} (${jobData.location})`);
      }
    }

    console.log('\n✅ Career data seeded successfully!');
    console.log(`\nCreated:`);
    console.log(`  - ${departments.length} departments`);
    console.log(`  - ${jobs.length} jobs`);
    console.log('\nYou can now view the jobs at: http://localhost:3000/career/jobs');

    await app.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding career data:', error);
    console.error('Details:', error.message);
    process.exit(1);
  }
}

seedCareerData();

