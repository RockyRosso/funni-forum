export const useUserData = defineStore('userData', {
    state: () => ({
        user: {} as any,
        isAuthenticated: false,
        isAdmin: false,
    }),

    actions: {
        setAuthState(state: boolean) {
            this.isAuthenticated = state;
        },

        setAdminSate(state: boolean) {
            this.isAdmin = state;
        },

        setUserData(user: any) {
            this.user = user;
        },
    },
});
