//-- Variables

import { Prisma } from '@prisma/client';
import prisma from '../db/prisma';

import categoriesSchema from '../schemas/categories';
import permissionSchema from '../schemas/permissions';

//--

//-- Functions

async function loadDefaultData(currentData: any[], schemaData: any[], table: "user" | "userSetting" | "session" | "permission" | "post" | "comment" | "category") {
    if (
        currentData.length === 0 ||
        currentData.length !== schemaData.length ||
        JSON.stringify(currentData) !== JSON.stringify(schemaData)
    ) {
        try {
            if (currentData.length === 0) return await prisma[table].createMany({
                data: schemaData
            })

            for (let i = 0; i < currentData.length; i++) {
                const dataObject = schemaData.find((c) => c.id === currentData[i].id);

                if (!dataObject) continue;

                const data = JSON.parse(JSON.stringify(dataObject)); // Clone object
                delete data.id

                await prisma[table].update({
                    where: {
                        id: dataObject.id
                    },

                    data
                });
            }

        } catch (e) {
            console.error(e);
        }
    }
}

//--

export default defineNitroPlugin(async () => {
    const permissions = await prisma.permission.findMany();
    await loadDefaultData(permissions, permissionSchema, 'permission');

    const categories = await prisma.category.findMany();
    await loadDefaultData(categories, categoriesSchema, 'category');

    console.log('Permissions and categories loaded!');
});
