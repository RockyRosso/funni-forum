//-- Variables

import User from '../serverUtils/user';

//--

export default defineEventHandler(async (event) => {
    const { sessionIdCookieName, userIdCookieName } = useAppConfig();

    const whitelistedRoutesForRestricted = [
        '/api/user/auth',
        '/banned',
        '/api/user/personal/verification/resend',
        '/api/user/personal/logout',
        '/verifycallback'
    ];

    const whitelistedRoutesForNonVerified = [
        '/personal/settings',
        '/api/user/personal/email'
    ]

    const query = event.path.split('?');
    let sessionId = getCookie(event, sessionIdCookieName);

    if (!sessionId) {
        for (let i = 0; i < query.length; i++) {
            if (query[i].startsWith(sessionIdCookieName)) {
                sessionId = query[i].split('=')[1];
            }
        }
    }

    const user = await User.fetchUserFromSessionId(sessionId || '');

    // Validate if user is authenticated

    if (!user) {
        if (!event.path.match(/(personal.*|posteditor.*|admin.*)/)) {
            if (event.context.params) {
                if (event.method === 'GET') return;
            }

            if (event.method !== 'DELETE') return;
        }

        if (!event.path.startsWith('/api')) {
            return await sendRedirect(event, '/login');
        }

        setResponseStatus(event, 403);
        return { statusCode: 403, message: 'Unauthorized' };
    }

    if (!user.verified) {
        if (!event.path.match(/(personal.*|posteditor.*|admin.*)/)) {
            if (event.context.params) {
                if (event.method === 'GET') return;
            }

            if (event.method !== 'DELETE') return;
        }

        if (whitelistedRoutesForRestricted.includes(event.path.split('?')[0]) || whitelistedRoutesForNonVerified.includes(event.path.split('?')[0]))
            return;

        if (!event.path.startsWith('/api')) {
            return await sendRedirect(event, '/');
        }

        setResponseStatus(event, 403);
        return { statusCode: 403, message: 'Unauthorized' };
    }

    event.headers.append('x-called-by', user.id);
    event.headers.append('x-user-permission', `${user.permission.id}`);
    event.headers.append('x-user-email', user.email);

    // Validate if a user is suspended

    if (user) {
        if (
            user.banned &&
            !whitelistedRoutesForRestricted.includes(event.path.split('?')[0])
        ) {
            return await sendRedirect(event, '/banned');
        }
    }

    // Validate user property modifications

    if (
        event.method === 'PUT' ||
        event.method === 'POST' ||
        event.method === 'PATCH'
    ) {
        const params = event.context.params;

        if (!params) return;
        if (!params.username) return;

        const targetUsername = params.username;

        const userClass = new User(user.id);

        if (targetUsername !== user.username) {
            if (!(await userClass.verifyValidPermission('ADMINISTRATOR')))
                return { statusCode: 403, message: 'Unauthorized' };
        }
    }

    // Validate if user is admin

    if (event.path.startsWith('/admin')) {
        const userClass = new User(user.id);

        if (!(await userClass.verifyValidPermission('ADMINISTRATOR'))) {
            setResponseStatus(event, 403);
            return { statusCode: 403, message: 'Unauthorized' };
        }
    }

    setCookie(event, userIdCookieName, user.id);
});
