const { parseMultipartData, sanitizeOutput } = require('@strapi/utils');

module.exports = {
    async uploadAvatar(ctx) {
        const userId = ctx.state.user.id;
        try {
            if (ctx.is('multipart')) {
                const { data, files } = parseMultipartData(ctx);
                const uploadService = strapi.plugin('upload').service('upload');
                const uploadedFile = await uploadService.upload({
                    data: { refId: userId, ref: 'plugin::users-permissions.user', field: 'avatar' },
                    files,
                });
                const updatedUser = await strapi.entityService.update('plugin::users-permissions.user', userId, {
                    data: { avatar: uploadedFile[0].id },
                });
                return sanitizeOutput(updatedUser, ctx);
            }
        } catch (err) {
            ctx.badRequest('Upload failed', { error: err.message });
        }
    },
};