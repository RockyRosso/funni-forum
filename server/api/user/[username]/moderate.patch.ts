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
    const { ban } = await readBody(event);

    const params = event.context.params;

    if (!params) return badRequestError(event);
    if (!params.username) return badRequestError(event);

    const executorId = event.headers.get('x-called-by');
    const target = params.username;

    const targetProfile = await User.fetchUserFromUsername(target);

    if (!targetProfile) return notFoundError(event);
    if (executorId === targetProfile.id) return unauthorizedError(event); // Can't let the user ban themselves ;)

    const targetClass = new User(targetProfile.id);

    const suspended = await targetClass.toggleSuspension(ban);

    if (!suspended) return internalServerError(event);

    return { message: target + ' suspended' };
});
