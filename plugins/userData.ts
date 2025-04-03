export default defineNuxtPlugin(() => {
    return {
        provide: {
            isAuthenticated() {
                const userState = useUserData();

                return userState.isAuthenticated;
            },

            async getUser(basiccheck?: boolean) {
                const userState = useUserData();

                if (Object.keys(userState.user).length === 0) {
                    try {
                        const userData = await useFetch('/api/user/auth', {
                            method: 'GET',

                            params: {
                                basiccheck,
                            },
                        });

                        if (!userData.data) return;
                        if (!userData.data.value) return;

                        userState.setUserData(userData.data.value);

                        return userData.data.value;
                    } catch (e) {
                        console.error(e);

                        return;
                    }
                }

                return userState.user;
            },

            async logoutUser() {
                const userState = useUserData();
                userState.setUserData({});
            },
        },
    };
});
