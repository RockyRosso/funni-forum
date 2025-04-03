//-- Variables

import UserAuth from '~/server/serverUtils/userAuth';

import { badRequestError } from '~/server/serverUtils/resonseGenerator';

import { defaultCookieConfig } from '~/server/serverUtils/managers/cookieManager';
import User from '~/server/serverUtils/user';

//--

export default defineEventHandler(async (event) => {
    const { sessionIdCookieName, userIdCookieName } = useAppConfig();

    const body = JSON.parse(await readBody(event));

    const email = body.email;
    const password = body.password;

    if (typeof email !== 'string') return badRequestError(event);
    if (typeof password !== 'string') return badRequestError(event);

    if (password === '') return badRequestError(event);

    const userAuth = new UserAuth();

    if (await User.fetchUserFromEmail(email)) {
        setResponseStatus(event, 403);

        return { message: 'An account with this email already exists!' };
    }

    const data = await userAuth.signup(password, false, email);

    if (!data) return { status: 403, message: userAuth.errorMessage };

    setCookie(
        event,
        sessionIdCookieName,
        data.sessionId,
        defaultCookieConfig(),
    );
    setCookie(event, userIdCookieName, data.id, defaultCookieConfig());

    setResponseStatus(event, 201);
});
