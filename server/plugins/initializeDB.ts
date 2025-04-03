import prisma from '~/server/db/prisma';
import mongoose from 'mongoose';

import * as dotenv from 'dotenv';
dotenv.config();

const authCodesDBUrl = process.env.AUTH_CODES_DB_URL;

export default defineNitroPlugin(async (nitro) => {
    await mongoose.connect(authCodesDBUrl || '');

    console.log('MongoDB connection intiailized');

    await prisma.$connect();

    console.log('PostgreSQL connection initialized');

    console.log('Intialized Databases');

    nitro.hooks.hook("close", async () => {
        await mongoose.connection.close();
        await prisma.$disconnect();
    })
});
