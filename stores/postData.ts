export const usePostData = defineStore('postData', {
    state: () => ({
        files: [] as File[],
        postContent: '',
        category: {},
    }),

    actions: {
        async modify(property: string, value: any) {
            this[property as keyof typeof this.$state] = value;
        },
    },
});
