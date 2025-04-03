//-- Variables

import { getIp } from '../serverUtils/ip';
import { defaultCookieConfig } from '../serverUtils/managers/cookieManager';
import {
    badRequestError,
    unauthorizedError,
} from '../serverUtils/resonseGenerator';
import User from '../serverUtils/user';
import UserAuth from '../serverUtils/userAuth';

//--

export default defineEventHandler(async (event) => {
    const { sessionIdCookieName, userIdCookieName } = useAppConfig();

    const { code, error } = getQuery(event);

    if (error) {
        return await sendRedirect(event, '/');
    }

    if (typeof code !== 'string') return badRequestError(event);

    let resultData;

    const userAuth = new UserAuth();

    const { tokens, userInfo } = await UserAuth.generateOauthData(code);
    const userData = await User.fetchUserFromEmail(userInfo.data.email || '');

    const clientIp = getIp(event); // TODO: Make IPs an optional argument

    if (userData) {
        const loginResult = await userAuth.login(
            userData.email,
            tokens,
            true,
            clientIp,
        );
        resultData = loginResult?.result;
    } else {
        const signupResult = await userAuth.signup(tokens, true);
        resultData = signupResult?.result;
    }

    if (!resultData) return unauthorizedError(event);
    if (!resultData.sessionId) return unauthorizedError(event);
    setCookie(
        event,
        sessionIdCookieName,
        resultData.sessionId,
        defaultCookieConfig(),
    );
    setCookie(event, userIdCookieName, resultData.id, defaultCookieConfig());

    if (resultData.action === 'signup') {
        await sendRedirect(
            event,
            `/personal/welcome?s_id=${resultData.sessionId}`,
        );
        return;
    }

    await sendRedirect(event, '/');
});
