//-- Variables

import prisma from '../db/prisma';
import { notFoundError } from '../serverUtils/resonseGenerator';
import User from '../serverUtils/user';

//--

export default defineEventHandler(async (event) => {
    const { ownedby } = getQuery(event);

    if (ownedby && typeof ownedby === 'string') {
        const user = await User.fetchUserFromUsername(ownedby);

        if (!user) return notFoundError(event);

        const permissionName = user.permission.name;

        const permissions = await prisma.permission.findMany({
            where: {
                NOT: {
                    name: {
                        equals: permissionName,
                    },
                },
            },
        });

        return { userPermissions: [user.permission], permissions };
    }

    const permissions = await prisma.permission.findMany();

    return { permissions };
});
