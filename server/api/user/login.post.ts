//-- Variables

import {
    badRequestError,
    unauthorizedError,
} from '~/server/serverUtils/resonseGenerator';
import UserAuth from '~/server/serverUtils/userAuth';

import { defaultCookieConfig } from '~/server/serverUtils/managers/cookieManager';
import { getIp } from '~/server/serverUtils/ip';
import User from '~/server/serverUtils/user';

//--

export default defineEventHandler(async (event) => {
    const { sessionIdCookieName, userIdCookieName } = useAppConfig();

    const body = await readBody(event);

    const parsedBody = JSON.parse(body);

    const email = parsedBody.email;
    const password = parsedBody.password;

    const sessionId = getCookie(event, sessionIdCookieName);

    if (typeof email !== 'string') return badRequestError(event);
    if (typeof password !== 'string') return badRequestError(event);
    if (password === '') return badRequestError(event);

    if (await User.fetchUserFromSessionId(sessionId || ''))
        // Check if the user is currently logged in
        return unauthorizedError(event);

    const userAuth = new UserAuth();

    const ip = getIp(event);

    const data = await userAuth.login(email, password, false, ip);

    if (!data) {
        setResponseStatus(event, 401);

        return { message: userAuth.errorMessage };
    }

    if (!data.sessionId) {
        setResponseStatus(event, 401);

        return { message: userAuth.errorMessage };
    }

    setCookie(
        event,
        sessionIdCookieName,
        data.sessionId,
        defaultCookieConfig(),
    );
    setCookie(event, userIdCookieName, data.id, defaultCookieConfig());
});
