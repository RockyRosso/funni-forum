//-- Variables

import { unauthorizedError } from '~/server/serverUtils/resonseGenerator';
import UserAuth from '~/server/serverUtils/userAuth';

//--

export default defineEventHandler(async (event) => {
    const { sessionIdCookieName } = useAppConfig();

    const userId = getCookie(event, 'u_id');
    const sessionId = getCookie(event, sessionIdCookieName);

    if (!userId) return unauthorizedError(event);
    if (!sessionId) return unauthorizedError(event);

    const userAuth = new UserAuth(userId);
    await userAuth.logout(sessionId);

    setResponseStatus(event, 200);
});
