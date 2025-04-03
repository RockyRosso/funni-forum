//-- Variables

import User from '~/server/serverUtils/user';
import { defaultCookieConfig } from '~/server/serverUtils/managers/cookieManager';

//--

export default defineEventHandler(async (event) => {
    const { sessionIdCookieName, userIdCookieName } = useAppConfig();

    const { basiccheck } = getQuery(event);
    const user = await User.fetchUserFromSessionId(
        getCookie(event, sessionIdCookieName) || '',
    );

    if (!user) return;

    setCookie(event, userIdCookieName, user.id, defaultCookieConfig());

    if (basiccheck && Boolean(basiccheck)) {
        return {
            id: user.id,
            email: user.email,
            verified: user.verified,
            username: user.username,
            picture: user.picture,
            permission: user.permission,
        };
    }

    return user;
});
