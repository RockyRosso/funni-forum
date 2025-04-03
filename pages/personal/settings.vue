<script lang="ts">
export default {
    data() {
        return {
            userData: {
                username: '',
                picture: '',
                email: '',
            },

            preferences: {} as any,
            previousUserData: {} as any,

            categories: [] as {
                name: string;
                id: number;
                color: string;
                description: string | null;
            }[],
        };
    },

    methods: {
        formatText(string: string) {
            let splitString = string.split('_');

            for (let i = 0; i < splitString.length; i++) {
                splitString[i] =
                    splitString[i][0].toUpperCase() + splitString[i].slice(1);
            }

            return splitString.join(' ');
        },

        async loadPage(userData: any) {
            const personalSettings = userData.settings;
            const { cdnUrl } = useAppConfig();

            setTimeout(() => {
                // The amount of pain I get putting a fucking setimeout here
                this.userData.username = userData.username;
                this.userData.picture = cdnUrl + userData.picture;
                this.userData.email = userData.email;
            }, 500);

            this.preferences = personalSettings;

            this.previousUserData = userData;

            const categories = await this.$getCategories();

            if (categories) {
                this.categories = categories;
            }
        },

        async saveSettings(categoryId?: number) {
            const categoryNotifications =
                this.preferences.category_notifications;

            if (categoryId) {
                const arrayIndex = categoryNotifications.findIndex(
                    (c: any) => c.id === categoryId,
                );

                if (arrayIndex > -1) {
                    categoryNotifications.splice(arrayIndex, 1);
                    this.preferences.category_notifications =
                        categoryNotifications;
                } else {
                    categoryNotifications.push({ id: categoryId });
                }
            }

            try {
                await $fetch('/api/user/personal/settings', {
                    method: 'PATCH',

                    body: this.preferences,
                });

                this.$showPopup({
                    content: 'Successfully saved settings',
                    type: 'success',
                    isTimed: true,
                });
            } catch (e) {
                console.error(e);
                return this.$showPopup({
                    content: 'Unable to save settings',
                    type: 'error',
                    isTimed: true,
                });
            }
        },

        async saveProfileSettings() {
            let profileSettingData;
            let profileSetting;

            if (
                JSON.stringify(this.userData) ===
                JSON.stringify(this.previousUserData)
            )
                return;

            if (this.userData.username !== this.previousUserData.username) {
                profileSetting = 'username';
                profileSettingData = this.userData.username;
            }

            if (this.userData.email !== this.previousUserData.email) {
                profileSetting = 'email';
                profileSettingData = this.userData.email;
            }

            if (!profileSettingData) return;
            if (!profileSetting) return;

            const result = await fetch(`/api/user/personal/${profileSetting}`, {
                method: 'PUT',

                body: JSON.stringify({
                    [profileSetting]: profileSettingData,
                }),
            });

            const response = await result.json();

            if (result.status > 226) {
                return this.$showPopup({
                    content: response?.message,
                    type: 'error',
                    isTimed: true,
                });
            }

            this.previousUserData = response?.data;

            this.$showPopup({
                content: 'Setting saved!',
                type: 'success',
                isTimed: true,
            });
        },

        changePfp() {
            this.$showModal('pfpCreatorModal');

            this.$on('pfpUploadComplete', () => {
                this.$showPopup({
                    type: 'success',
                    content: 'Updated profile picture!',
                });

                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            });
        },
    },

    async beforeCreate() {
        try {
            const userData = await this.$getUser();

            await this.loadPage(userData);
        } catch (e) {
            console.error(e);
        }
    },

    setup() {
        /* 

        For whatever reason, Nuxt currently has a problem where HTML rendered on the server will be overwritten and removed
        by layouts because for some reason layouts are not rendered on the server :sob:
        And I'm not blowing up people's machines by rendering the entire page on the client

        Sometimes I question if Nuxt was the right web framework to choose

        */

        definePageMeta({
            layout: false,
        });
    },
};
</script>

<template>
    <Title>Settings</Title>

    <header>
        <Siteheader />
    </header>

    <div class="modals">
        <ModalsPfpCreatorModal :picture="userData.picture" />
    </div>

    <div id="profile-info" class="padding section">
        <h1>Profile Info</h1>
        <div class="section flex transparent">
            <div>
                <img
                    loading="lazy"
                    :src="userData.picture"
                    class="pfp medium"
                />
                <div style="margin-top: 20px">
                    <button @click="changePfp" data-btn-style="secondary">
                        <i class="fa-solid fa-pen"></i> Edit Picture
                    </button>
                </div>
            </div>
            <div class="form">
                <form @submit.prevent>
                    <div class="form-input">
                        <label><span>Username</span></label>
                        <input
                            v-model="userData.username"
                            data-input-style="primary"
                            type="text"
                            required
                        />
                    </div>

                    <div class="form-input">
                        <label>Email</label>
                        <input
                            v-model="userData.email"
                            data-input-style="primary"
                            type="email"
                            required
                        />
                    </div>
                </form>

                <button
                    @click="saveProfileSettings"
                    class="save-btn"
                    data-btn-style="success"
                >
                    <i class="fa-solid fa-floppy-disk"></i> Save Changes
                </button>
            </div>
        </div>

        <div id="notifications" class="section flex-between transparent">
            <h1>Notifications</h1>
            <div class="form">
                <form @submit.prevent>
                    <div
                        class="form-input checkbox"
                        v-for="(noitifcation, i) in preferences.notifications"
                    >
                        <label style="font-size: 20px"
                            ><span>{{ noitifcation.name }}</span></label
                        >
                        <input
                            @change="saveSettings()"
                            v-model="preferences.notifications[i].enabled"
                            data-input-style="primary"
                            type="checkbox"
                        />
                    </div>

                    <h3>Categories</h3>

                    <div
                        class="form-input checkbox"
                        v-for="(category, i) in categories"
                    >
                        <label style="font-size: 20px"
                            ><span>{{ formatText(category.name) }}</span></label
                        >
                        <input
                            @change="saveSettings(category.id)"
                            data-input-style="primary"
                            type="checkbox"
                            :checked="
                                preferences.category_notifications.find(
                                    (c: any) => c.id === category.id,
                                )
                                    ? true
                                    : false
                            "
                        />
                    </div>
                </form>
            </div>
        </div>

        <hr class="rounded" />

        <div class="section flex-between transparent">
            <h1>Security Options</h1>
            <div class="form">
                <form @submit.prevent>
                    <div
                        class="form-input checkbox"
                        v-for="(security_option, i) in preferences.security"
                    >
                        <label style="font-size: 20px"
                            ><span>{{ security_option.name }}</span></label
                        >
                        <input
                            @change="saveSettings()"
                            v-model="preferences.security[i].enabled"
                            data-input-style="primary"
                            type="checkbox"
                        />
                    </div>
                </form>
            </div>
        </div>
    </div>

    <footer>
        <LazyPopup />
    </footer>
</template>

<style scoped lang="scss">
h1 {
    font-size: 45px;
}

.form {
    margin-top: 40px;
}

.save-btn {
    margin-top: 50px;
}

.section {
    $spacing: 20px;
    margin-bottom: $spacing !important;
    margin-top: $spacing;
}

@media screen and (max-width: 820px) {
    .section {
        display: grid;
        place-content: center;

        width: 100%;
        box-shadow: none;
        border: none;
        border-radius: 0px;
    }
}
</style>
