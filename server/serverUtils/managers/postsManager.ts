//-- Variables

import { Prisma } from '@prisma/client';
import prisma from '../../db/prisma';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { formatDataPages } from './generalDataManager';

import * as dotenv from 'dotenv';
import { deleteObject } from '../s3Manager';
import User from '../user';
dotenv.config();

const APP_STATE = process.env.APP_STATE;

//--

//-- Functions

export async function validatePost(postId: string, userId: string) {
    const post = await prisma.post.findFirst({
        where: {
            id: postId,
            authorId: userId,
        },
    });

    if (!post) return;
    if (post.content !== null) return;

    return true;
}

export async function loadPostComments(
    postId: string,
    page?: number,
    author?: string,
) {
    const comments = await prisma.comment.findMany({
        where: {
            postId,

            NOT: {
                deleted: {
                    equals: true,
                },
            },
        },

        include: {
            likes: {
                select: {
                    id: true,
                    username: true,
                },
            },

            dislikes: {
                select: {
                    id: true,
                    username: true,
                },
            },

            author: {
                select: {
                    id: true,
                    username: true,
                    picture: true,
                },
            },

            commentRepliedTo: {
                select: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                        },
                    },

                    deleted: true,
                },
            },

            replies: {
                select: {
                    id: true,
                },

                where: {
                    NOT: {
                        deleted: {
                            equals: true,
                        },
                    },
                },
            },
        },

        orderBy: {
            date: 'asc',
        },
    });

    const commentData = formatDataPages(comments, page || 1);

    if (author) {
        const user = new User(author);
        const canDeletePosts = await user.verifyValidPermission('DELETE_POST');

        for (let i = 0; i < commentData.length; i++) {
            if (commentData[i].authorId === author || canDeletePosts) {
                commentData[i]['owner'] = true;
            }
        }
    }

    return commentData;
}

export async function loadPostsFromCategory(category: string, page: number) {
    const postQuery: Prisma.Category$postsArgs<DefaultArgs> = {
        select: {
            id: true,
            title: true,

            author: {
                select: {
                    id: true,
                    username: true,
                    picture: true,
                },
            },

            _count: {
                select: {
                    comments: {
                        where: {
                            NOT: {
                                deleted: {
                                    equals: true,
                                },
                            },
                        },
                    },
                    likes: true,
                },
            },

            date: true,
        },

        where: {
            NOT: {
                deleted: {
                    equals: true,
                },
            },
        },

        orderBy: {
            date: 'desc',
        },
    };

    const categoryData = await prisma.category.findFirst({
        where: {
            name: category,
        },

        include: {
            posts: postQuery,
        },
    });

    if (!categoryData) return;
    if (!categoryData) return;

    const posts = formatDataPages(
        categoryData.posts,
        page,
        (item) => item.title !== null,
    );

    if (!posts) return;

    return posts;
}

export async function fetchPost(postId: string) {
    return await prisma.post.findFirst({
        where: {
            id: postId,

            NOT: {
                deleted: {
                    equals: true,
                },
            },
        },
    });
}

export async function deletePost(postId: string) {
    const post = await prisma.post.findFirst({
        where: {
            id: postId
        }
    });

    if (!post) return;

    const postMedia = post.media;

    if (postMedia.length > 0) {
        for (let i = 0; i < postMedia.length; i++) {
            const result = await deleteObject(`${APP_STATE}/uploads/posts/${postId}/${postMedia[i]}`);

            if (!result) {
                console.error(`Failed to delete: ${postMedia[i]}`, result);
            }
        }
    }

    try {
        await prisma.post.update({
            where: {
                id: postId,
            },

            data: {
                deleted: true,
                content: null,
            },
        });

        return true;
    } catch (e) {
        console.log(e);
        return;
    }
}

//--
