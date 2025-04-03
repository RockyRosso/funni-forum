//-- Variables

import prisma from '~/server/db/prisma';
import { generateCommentId } from '../credentialGenerator';

//--

//-- Functions

async function checkForComment(commentId: string, postId: string) {
    const comment = await prisma.comment.findFirst({
        where: {
            id: commentId,
            postId,
        },
    });

    if (!comment) return;

    return true;
}

export async function deleteComment(commentId: string, postId: string) {
    try {
        await prisma.comment.update({
            where: {
                id: commentId,
                postId,
            },

            data: {
                content: '',
                deleted: true,
            },
        });

        return true;
    } catch (e) {
        console.error(e);
        return;
    }
}

export async function fetchComment(commentId: string, postId: string) {
    try {
        const commentData = await prisma.comment.findFirst({
            where: {
                id: commentId,
                postId,
            },
        });

        return commentData;
    } catch (e) {
        console.error(e);
    }
}

export async function postComment(
    userId: string,
    postId: string,
    commentContent: string,
    replyingTo?: string,
) {
    const commentId = await generateCommentId();

    let commentExists: boolean | undefined;

    if (replyingTo) {
        commentExists = await checkForComment(replyingTo, postId);

        if (!commentExists) return;
    }

    try {
        await prisma.comment.create({
            data: {
                id: commentId,
                content: commentContent,

                post: {
                    connect: {
                        id: postId,
                    },
                },

                commentRepliedTo:
                    replyingTo && commentExists
                        ? {
                              connect: {
                                  id: replyingTo,
                              },
                          }
                        : undefined,

                author: {
                    connect: {
                        id: userId,
                    },
                },
            },
        });

        return true;
    } catch (e) {
        console.error(e);
        return;
    }
}

//--
