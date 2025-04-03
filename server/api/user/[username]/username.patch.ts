//-- Variables

import {
    notFoundError,
    unauthorizedError,
    badRequestError,
    notAcceptableError,
    internalServerError,
} from '~/server/serverUtils/resonseGenerator';
import User from '~/server/serverUtils/user';

//--

export default defineEventHandler(async (event) => {
    const { newuser } = await readBody(event);

    const params = event.context.params;

    if (!params) return badRequestError(event);
    if (!params.username) return badRequestError(event);

    if (typeof newuser !== 'string') return badRequestError(event);

    const target = params.username;

    const targetUserProfile = await User.fetchUserFromUsername(target);

    if (!targetUserProfile) return notFoundError(event);

    const targetUser = new User(targetUserProfile.id);
    const validUsername = User.checkUsername(newuser);

    if (!validUsername)
        return { message: 'Invalid character(s)', failed: true };

    if (await User.fetchUserFromUsername(newuser)) {
        return { message: 'Username already taken!', failed: true };
    }

    const updateResult = await targetUser.modifyUsername(newuser);

    if (!updateResult) return internalServerError(event);

    return { message: 'Updated username!', failed: false };
});
