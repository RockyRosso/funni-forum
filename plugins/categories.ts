export default defineNuxtPlugin(async () => {
    return {
        provide: {
            async getCategories() {
                const result = await useFetch('/api/categories', {
                    method: 'GET',
                });

                if (result) {
                    return result.data.value;
                }

                return;
            },
        },
    };
});
