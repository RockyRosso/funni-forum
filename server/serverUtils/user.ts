//-- Variables

import { $Enums, Prisma } from '@prisma/client';
import { generateId } from './credentialGenerator';

import { uploadObject } from './s3Manager';
import prisma from '../db/prisma';

const userQuery = {
    id: true,
    username: true,
    picture: true,

    email: true,
    permission: true,

    verified: true,

    settings: {
        include: {
            category_notifications: {
                select: {
                    id: true,
                },
            },
        },
    },

    join_date: true,

    banned: true,
};

//--

//-- Classes

export default class User {
    id: string;
    private appConfig: any;

    constructor(id: string) {
        this.id = id;

        this.appConfig = useAppConfig();
    }

    async uploadProfilePicture(url: string) {
        const file = await fetch(url.split('=')[0], {
            method: 'GET',
        });

        const pictureId = generateId(32);

        await uploadObject(
            `${process.env.APP_STATE}/uploads/users/${this.id}/${pictureId}.png`,
            Buffer.from(await file.arrayBuffer()),
        );

        return pictureId;
    }

    async verifyValidPermission(
        permission: $Enums.PermissionActions | $Enums.PermissionActions[],
    ) {
        const user = await prisma.user.findFirst({
            where: {
                id: this.id,
            },

            select: {
                permission: true,
            },
        });

        if (!user) return;
        if (!user?.permission) return;

        if (user.permission.actions.includes('ADMINISTRATOR')) return true;

        if (typeof permission === 'object') {
            for (let i = 0; i < permission.length; i++) {
                if (!user.permission.actions.includes(permission[i])) return;
            }

            return true;
        }

        if (user.permission.actions.includes(permission)) return true;

        return;
    }

    async modifyPermission(permission: string) {
        return await this.modifyUser({
            permission: {
                connect: {
                    name: permission,
                },
            },
        });
    }

    async modifyUsername(newuser: string) {
        return await this.modifyUser({
            username: newuser,
        });
    }

    async toggleSuspension(suspend: boolean) {
        if (suspend) {
            return await this.modifyUser({
                banned: true,
            });
        }

        return await this.modifyUser({
            banned: false,
        });
    }

    private async modifyUser(data: Prisma.UserUpdateInput) {
        try {
            const result = await prisma.user.update({
                where: {
                    id: this.id,
                },

                data,
            });

            if (result) return true;
        } catch (e) {
            console.error(e);
            return;
        }
    }

    static checkUsername(username: string) {
        const notAllowed = /([\s$%^&'*'!@#()_])/g;

        if (username.match(notAllowed)) return;

        return true;
    }

    static async fetchUserFromSessionId(sessionId: string) {
        try {
            const session = await prisma.session.findFirst({
                where: {
                    id: sessionId,
                },

                select: {
                    owner: {
                        select: userQuery,
                    },
                },
            });

            return session?.owner;
        } catch (e) {
            return;
        }
    }

    static async fetchUserFromEmail(email: string) {
        const user = await prisma.user.findFirst({
            where: {
                email,
            },

            select: userQuery,
        });

        return user;
    }

    static async fetchUserFromUsername(username: string) {
        const user = await prisma.user.findFirst({
            where: {
                username,
            },

            select: userQuery,
        });

        return user;
    }

    static async fetchUserList(page?: number | string) {
        const { maxPageSize } = useAppConfig();

        if (!page) {
            page = 1;
        }

        if (typeof page === 'string') {
            page = Number(page);
        }

        if (page === 1) {
            page = 0;
        }

        try {
            const users = await prisma.user.findMany({
                select: userQuery,

                skip: maxPageSize * page,
                take: maxPageSize,

                orderBy: {
                    join_date: 'desc',
                },
            });

            if (users) return users;
        } catch (e) {
            console.error(e);
            return;
        }
    }
}

//--
