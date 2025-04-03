//-- Variables

import prisma from '../db/prisma';

//--

export default defineEventHandler(async (event) => {
    const users = await prisma.user.count();
    const posts = await prisma.post.count();
    const comments = await prisma.comment.count();

    return [
        {
            name: 'Users',
            value: users,
            img: '/assets/icons/user.png',
        },

        {
            name: 'Posts',
            value: posts,
            img: '/assets/icons/post.png',
        },

        {
            name: 'Comments',
            value: comments,
            img: '/assets/icons/comment.png',
        },
    ];
});
