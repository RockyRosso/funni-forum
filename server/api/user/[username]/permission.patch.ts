//-- Variables

import {
    badRequestError,
    internalServerError,
    notFoundError,
    unauthorizedError,
} from '~/server/serverUtils/resonseGenerator';
import User from '~/server/serverUtils/user';

//--

export default defineEventHandler(async (event) => {
    const { permission } = await readBody(event);

    const params = event.context.params;

    if (!params) return badRequestError(event);
    if (!params.username) return badRequestError(event);

    if (typeof permission !== 'string') return badRequestError(event);

    const executorId = event.headers.get('x-called-by');

    if (!executorId) return unauthorizedError(event);

    const target = params.username;
    const targetUserProfile = await User.fetchUserFromUsername(target);

    if (!targetUserProfile) return notFoundError(event);
    if (targetUserProfile.id === executorId) return unauthorizedError(event);

    const targetUser = new User(targetUserProfile.id);

    const permissionUpdated = await targetUser.modifyPermission(permission);

    if (!permissionUpdated) return internalServerError(event);

    return { message: 'Updated user permission' };
});
