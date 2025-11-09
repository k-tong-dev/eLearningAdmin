/**
 * Script to import menu items into Strapi using the API
 * This ensures all Strapi internal fields are properly set
 * 
 * Run: node scripts/import-menu-items.js
 */

'use strict';

const menuItems = [
    // Pages
    { code: 'home', title: 'Home', description: 'Go to homepage', href: '/', icon: 'fa fa-home', category: 'page', keywords: ['home', 'main', 'landing', 'start'], gradient: 'from-blue-500 to-cyan-500', requiresAuth: false, requiresPro: false },
    { code: 'about', title: 'About Us', description: 'Learn about our mission and values', href: '/about', icon: 'fa fa-info-circle', category: 'page', keywords: ['about', 'mission', 'values', 'company', 'team'], gradient: 'from-purple-500 to-pink-500', requiresAuth: false, requiresPro: false },
    { code: 'contact', title: 'Contact', description: 'Reach out to our team', href: '/contact', icon: 'fa fa-phone', category: 'page', keywords: ['contact', 'support', 'help', 'email', 'reach'], gradient: 'from-violet-500 to-fuchsia-500', requiresAuth: false, requiresPro: false },
    { code: 'support', title: 'Support', description: 'Get help and find answers', href: '/support', icon: 'fa fa-question-circle', category: 'page', keywords: ['support', 'help', 'faq', 'assistance', 'guide'], gradient: 'from-indigo-500 to-purple-500', requiresAuth: false, requiresPro: false },
    { code: 'services', title: 'Services', description: 'Explore our comprehensive offerings', href: '/services', icon: 'fa fa-bolt', category: 'page', keywords: ['services', 'offerings', 'solutions', 'what we do'], gradient: 'from-orange-500 to-red-500', requiresAuth: false, requiresPro: false },
    { code: 'pricing', title: 'Pricing', description: 'View subscription plans and pricing', href: '/pricing', icon: 'fa fa-dollar-sign', category: 'page', keywords: ['pricing', 'plans', 'subscription', 'cost', 'price'], gradient: 'from-green-500 to-emerald-500', requiresAuth: false, requiresPro: false },
    { code: 'career', title: 'Career', description: 'Join our team', href: '/career', icon: 'fa fa-briefcase', category: 'page', keywords: ['career', 'jobs', 'hiring', 'work', 'join'], gradient: 'from-teal-500 to-cyan-500', requiresAuth: false, requiresPro: false },
    { code: 'privacy', title: 'Privacy Policy', description: 'Read our privacy policy', href: '/privacy', icon: 'fa fa-shield', category: 'page', keywords: ['privacy', 'policy', 'data', 'protection', 'security'], gradient: 'from-indigo-500 to-purple-500', requiresAuth: false, requiresPro: false },
    { code: 'terms', title: 'Terms of Service', description: 'Read our terms of service', href: '/terms', icon: 'fa fa-file-text', category: 'page', keywords: ['terms', 'service', 'agreement', 'legal', 'conditions'], gradient: 'from-gray-500 to-slate-500', requiresAuth: false, requiresPro: false },
    { code: 'demo', title: 'Demo', description: 'View platform demo', href: '/demo', icon: 'fa fa-play-circle', category: 'page', keywords: ['demo', 'trial', 'preview', 'example', 'showcase'], gradient: 'from-blue-500 to-cyan-500', requiresAuth: false, requiresPro: false },
    // Features - Auth Required
    { code: 'dashboard', title: 'Dashboard', description: 'Your learning dashboard', href: '/dashboard', icon: 'fa fa-dashboard', category: 'feature', keywords: ['dashboard', 'my', 'overview', 'stats', 'progress'], gradient: 'from-blue-500 to-indigo-500', requiresAuth: true, requiresPro: false },
    { code: 'overview', title: 'Overview', description: 'Dashboard overview and statistics', href: '/dashboard?tab=overview', icon: 'fa fa-chart-bar', category: 'feature', keywords: ['overview', 'dashboard', 'stats', 'summary', 'home'], gradient: 'from-blue-500 to-indigo-500', requiresAuth: true, requiresPro: false },
    { code: 'my-courses', title: 'My Courses', description: 'View your enrolled courses', href: '/dashboard?tab=my-courses', icon: 'fa fa-book', category: 'feature', keywords: ['my courses', 'enrolled', 'learning', 'studying'], gradient: 'from-purple-500 to-pink-500', requiresAuth: true, requiresPro: false },
    { code: 'my-learning', title: 'My Learning', description: 'Track your learning progress', href: '/dashboard?tab=my-learning', icon: 'fa fa-chart-line', category: 'feature', keywords: ['learning', 'progress', 'track', 'stats'], gradient: 'from-green-500 to-emerald-500', requiresAuth: true, requiresPro: false },
    { code: 'enrollments', title: 'Enrollments', description: 'View your course enrollments', href: '/dashboard?tab=enrollments', icon: 'fa fa-graduation-cap', category: 'feature', keywords: ['enrollments', 'enrolled', 'courses', 'students'], gradient: 'from-purple-500 to-pink-500', requiresAuth: true, requiresPro: false },
    { code: 'expenditure', title: 'Expenditure', description: 'Track your spending and purchases', href: '/dashboard?tab=expenditure', icon: 'fa fa-wallet', category: 'feature', keywords: ['expenditure', 'spending', 'purchases', 'payments', 'billing'], gradient: 'from-orange-500 to-red-500', requiresAuth: true, requiresPro: false },
    { code: 'reports', title: 'My Reports', description: 'View and manage your reports', href: '/dashboard?tab=reports', icon: 'fa fa-bug', category: 'feature', keywords: ['reports', 'issues', 'bugs', 'feedback', 'support'], gradient: 'from-red-500 to-pink-500', requiresAuth: true, requiresPro: false },
    { code: 'contacts', title: 'My Contacts', description: 'Manage your contacts and connections', href: '/dashboard?tab=contact', icon: 'fa fa-address-book', category: 'feature', keywords: ['contacts', 'connections', 'people', 'network'], gradient: 'from-blue-500 to-cyan-500', requiresAuth: true, requiresPro: false },
    { code: 'friends', title: 'Friends', description: 'Manage your friends and connections', href: '/dashboard?tab=friends', icon: 'fa fa-users', category: 'feature', keywords: ['friends', 'connections', 'social', 'network'], gradient: 'from-indigo-500 to-purple-500', requiresAuth: true, requiresPro: false },
    { code: 'profile', title: 'Profile', description: 'View and edit your profile', href: '/dashboard?tab=profile', icon: 'fa fa-user', category: 'feature', keywords: ['profile', 'account', 'settings', 'edit'], gradient: 'from-blue-500 to-cyan-500', requiresAuth: true, requiresPro: false },
    { code: 'notifications', title: 'Notifications', description: 'View your notifications', href: '/dashboard?tab=notifications', icon: 'fa fa-bell', category: 'feature', keywords: ['notifications', 'alerts', 'updates', 'messages'], gradient: 'from-orange-500 to-red-500', requiresAuth: true, requiresPro: false },
    { code: 'settings', title: 'Settings', description: 'Manage your account settings', href: '/dashboard?tab=settings', icon: 'fa fa-cog', category: 'feature', keywords: ['settings', 'preferences', 'config', 'options'], gradient: 'from-gray-500 to-slate-500', requiresAuth: true, requiresPro: false },
    // Pro Features
    { code: 'create-course', title: 'Create Course', description: 'Create and publish your own course', href: '/dashboard?tab=my-courses&create=true', icon: 'fa fa-video', category: 'feature', keywords: ['create', 'course', 'publish', 'teach', 'instructor'], gradient: 'from-purple-500 to-pink-500', requiresAuth: true, requiresPro: true },
    { code: 'instructor-dashboard', title: 'Instructor Dashboard', description: 'Manage your instructor account', href: '/dashboard?tab=instructors', icon: 'fa fa-chalkboard-teacher', category: 'feature', keywords: ['instructor', 'teach', 'monetize', 'earnings'], gradient: 'from-orange-500 to-red-500', requiresAuth: true, requiresPro: true },
    { code: 'analytics', title: 'Analytics', description: 'View detailed analytics and insights', href: '/dashboard?tab=analytics', icon: 'fa fa-chart-pie', category: 'feature', keywords: ['analytics', 'stats', 'insights', 'reports'], gradient: 'from-indigo-500 to-purple-500', requiresAuth: true, requiresPro: true },
    { code: 'earnings', title: 'Earnings', description: 'View your course earnings', href: '/dashboard?tab=earnings', icon: 'fa fa-credit-card', category: 'feature', keywords: ['earnings', 'money', 'revenue', 'income'], gradient: 'from-green-500 to-emerald-500', requiresAuth: true, requiresPro: true },
    { code: 'instructor-analytics', title: 'Instructor Analytics', description: 'Advanced analytics for instructors', href: '/dashboard?tab=analytics', icon: 'fa fa-chart-bar', category: 'feature', keywords: ['analytics', 'instructor', 'stats', 'performance'], gradient: 'from-indigo-500 to-purple-500', requiresAuth: true, requiresPro: true },
    { code: 'course-management', title: 'Course Management', description: 'Manage and edit your courses', href: '/dashboard?tab=my-courses', icon: 'fa fa-book-open', category: 'feature', keywords: ['manage', 'courses', 'edit', 'update', 'content'], gradient: 'from-purple-500 to-pink-500', requiresAuth: true, requiresPro: true },
    // Public Features
    { code: 'courses', title: 'Courses', description: 'Browse all available courses', href: '/courses', icon: 'fa fa-graduation-cap', category: 'course', keywords: ['courses', 'learn', 'classes', 'education', 'training'], gradient: 'from-indigo-500 to-purple-500', requiresAuth: false, requiresPro: false },
    { code: 'instructors', title: 'Instructors', description: 'Meet our expert instructors', href: '/instructors', icon: 'fa fa-users', category: 'instructor', keywords: ['instructors', 'teachers', 'experts', 'mentors'], gradient: 'from-orange-500 to-red-500', requiresAuth: false, requiresPro: false },
    { code: 'blog', title: 'Blog', description: 'Read latest articles and updates', href: '/blog', icon: 'fa fa-newspaper-o', category: 'blog', keywords: ['blog', 'articles', 'news', 'posts', 'updates'], gradient: 'from-purple-500 to-pink-500', requiresAuth: false, requiresPro: false },
    { code: 'forum', title: 'Forum', description: 'Join discussions and connect with learners', href: '/forum', icon: 'fa fa-comments', category: 'forum', keywords: ['forum', 'discussion', 'community', 'chat', 'talk'], gradient: 'from-blue-500 to-indigo-500', requiresAuth: true, requiresPro: false },
];

async function importMenuItems() {
    const { createStrapi, compileStrapi } = require('@strapi/strapi');
    
    // Compile Strapi first to load all configurations
    const appContext = await compileStrapi();
    const strapi = await createStrapi(appContext).load();
    
    strapi.log.level = 'error'; // Reduce log noise

    try {
        console.log(`Starting import of ${menuItems.length} menu items...\n`);

        for (const item of menuItems) {
            try {
                // Check if item already exists by code using documents API (Strapi v5)
                const existingItems = await strapi.documents('api::menu-controller.menu-controller').findMany({
                    filters: { code: item.code },
                    locale: 'en',
                });

                const existing = existingItems.length > 0 ? existingItems[0] : null;

                if (existing) {
                    // Update existing item
                    await strapi.documents('api::menu-controller.menu-controller').update({
                        documentId: existing.documentId,
                        data: {
                            ...item,
                            locale: 'en',
                            publishedAt: new Date(),
                        },
                    });
                    console.log(`✓ Updated: ${item.title}`);
                } else {
                    // Create new item
                    await strapi.documents('api::menu-controller.menu-controller').create({
                        data: {
                            ...item,
                            locale: 'en',
                            publishedAt: new Date(),
                        },
                    });
                    console.log(`✓ Created: ${item.title}`);
                }
            } catch (error) {
                console.error(`✗ Error processing ${item.title}:`, error.message);
                if (error.stack) {
                    console.error(error.stack);
                }
            }
        }

        console.log(`\n✅ Import completed!`);
        console.log(`\nNext steps:`);
        console.log(`1. Go to Strapi Admin → Content Manager → Menu Controller`);
        console.log(`2. Verify all items are visible and published`);
        console.log(`3. Test the API: http://localhost:1337/api/menu-controllers`);

        await strapi.destroy();
        process.exit(0);
    } catch (error) {
        console.error('Error importing menu items:', error);
        if (strapi) {
            await strapi.destroy();
        }
        process.exit(1);
    }
}

// Run the import
importMenuItems().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});

