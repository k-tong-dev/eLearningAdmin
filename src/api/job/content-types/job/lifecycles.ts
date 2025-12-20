/**
 * job lifecycles
 * Ensures jobStatus field is always valid and never empty
 * Syncs jobStatus with Strapi's publish state (publishedAt)
 * Note: Renamed from "status" to "jobStatus" to avoid conflict with Strapi's internal status
 */

export default {
  beforeCreate(event: any) {
    const { data } = event.params;

    // Ensure jobStatus is always set and valid
    if (!data.jobStatus || data.jobStatus === null || data.jobStatus === undefined) {
      // jobStatus is missing - set default based on publish state
      // If publishedAt is set, set jobStatus to 'open', otherwise 'draft'
      data.jobStatus = data.publishedAt ? 'open' : 'draft';
    } else {
      // jobStatus exists - normalize it
      const statusValue = String(data.jobStatus).trim().toLowerCase();
      
      // Validate jobStatus is one of the allowed enum values
      if (['draft', 'open', 'closed'].includes(statusValue)) {
        data.jobStatus = statusValue;
      } else {
        // Invalid jobStatus - set to default based on publish state
        strapi.log.warn(`[Job Lifecycle] Invalid jobStatus "${data.jobStatus}", defaulting based on publish state`);
        data.jobStatus = data.publishedAt ? 'open' : 'draft';
      }
    }

    // Sync: If publishedAt is set but jobStatus is not 'open', set it to 'open'
    if (data.publishedAt && data.jobStatus !== 'open') {
      strapi.log.info(`[Job Lifecycle] Job is being published, setting jobStatus to 'open'`);
      data.jobStatus = 'open';
    }
  },

  beforeUpdate(event: any) {
    const { data } = event.params;

    // Only handle jobStatus field - don't touch publishedAt to avoid conflicts
    if (data.jobStatus !== undefined) {
      if (data.jobStatus === null || data.jobStatus === '') {
        // jobStatus is being cleared - set to default
        strapi.log.warn(`[Job Lifecycle] jobStatus was cleared, setting to "draft"`);
        data.jobStatus = 'draft';
      } else {
        // jobStatus is being updated - normalize and validate it
        const statusValue = String(data.jobStatus).trim().toLowerCase();
        
        // Validate jobStatus is one of the allowed enum values
        if (['draft', 'open', 'closed'].includes(statusValue)) {
          data.jobStatus = statusValue;
          // Don't modify publishedAt - let user control publish/unpublish separately
          // jobStatus is just for frontend filtering
        } else {
          // Invalid jobStatus - remove from update data so Strapi keeps existing value
          strapi.log.warn(`[Job Lifecycle] Invalid jobStatus "${data.jobStatus}" in update, keeping existing value`);
          delete data.jobStatus;
        }
      }
    }
    
    // Don't sync with publishedAt here - it causes errors
    // User should manually publish/unpublish jobs using Strapi's publish button
    // jobStatus and publishedAt are independent fields
  },

  afterUpdate(event: any) {
    // Simplified - no automatic publish/unpublish to avoid errors
    // User should manually publish/unpublish jobs using Strapi's publish button
    // The jobStatus field is just for filtering on the frontend
  },

  afterCreate(event: any) {
    // Removed entityService.update calls to prevent infinite loops
    // All sync logic is now handled in beforeCreate to avoid recursion
    // This hook is kept for potential future use but doesn't trigger updates
  },
};

