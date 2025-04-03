//-- Variables

import { Prisma } from '@prisma/client';
import prisma from '../db/prisma';
import { unauthorizedError } from '../serverUtils/resonseGenerator';
import User from '../serverUtils/user';
import { DefaultArgs } from '@prisma/client/runtime/library';

//--

export default defineEventHandler(async (event) => {
    const { sessionIdCookieName } = useAppConfig();
    const { permissionToPost } = getQuery(event);

    const defaultQuery: Prisma.CategorySelect<DefaultArgs> = {
        id: true,
        name: true,
        description: true,
        color: true,
        permission_required_id: true
    };

    let categories = await prisma.category.findMany({
        select: defaultQuery,

        orderBy: [{ id: 'asc' }],
    });

    if (permissionToPost) {
        const sessionId = getCookie(event, sessionIdCookieName);

        if (!sessionId) return unauthorizedError(event);

        const user = await User.fetchUserFromSessionId(sessionId);

        if (!user) return unauthorizedError(event);

        if (user.permission) {
            if (user.permission.id !== 1) {
                categories = categories.filter((v) => v.permission_required_id === user.permission.id || v.permission_required_id === null);
            } else {
                categories = categories.filter((v) => v.permission_required_id === null);
            }
        }
    }

    return categories;
});
