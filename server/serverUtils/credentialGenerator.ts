//-- Variables

import prisma from '../db/prisma';
import { randomBytes } from 'node:crypto';
import { generateHash } from './secureHashing';

//--

//-- Functions

export function generateId(
    len: number = 10,
    secure?: boolean,
    toHash?: string,
) {
    if (secure && toHash) {
        return btoa(generateHash(toHash).hash + Date.now().toString()).replace(
            /=/g,
            'e',
        );
    }

    const randomNumber = Math.random().toString();
    const bytes = randomBytes(len).toString('hex');
    const id = btoa(bytes + randomNumber).substring(1, len + 1);

    return id;
}

export async function generateIdWithCheck(
    len: number,
    location: string,
    secure?: boolean,
) {
    const id = generateId(len);

    const existingUser = await prisma.user.findFirst({
        where: {
            [location]: id,
        },
    });

    if (existingUser) {
        return await generateIdWithCheck(len, location, secure);
    }

    return id;
}

export async function generateSessionId(userId: string) {
    const id = generateId(32, true, userId);

    const existingSession = await prisma.session.findFirst({
        where: {
            id,
        },
    });

    if (existingSession) {
        return await generateSessionId(userId);
    }

    return id;
}

export async function generatePostId() {
    const id = generateId();

    const existingPost = await prisma.post.findFirst({
        where: {
            id,
        },
    });

    if (!existingPost) {
        return id;
    }

    return await generatePostId();
}

export async function generateCommentId() {
    const id = generateId();

    const existingComment = await prisma.comment.findFirst({
        where: {
            id,
        },
    });

    if (!existingComment) {
        return id;
    }

    return await generatePostId();
}

//--
