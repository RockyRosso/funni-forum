<template>
    <div class="flex">
        <div>
            <p>ID</p>
        </div>
        <div>
            <p id="datatitle">
                {{ dataType === 'user' ? 'username' : 'title' }}
            </p>
        </div>
        <div>
            <p>date</p>
        </div>
    </div>

    <div id="data-list" class="section primarybackground padding noshadow">
        <p v-if="dataFetchFail">
            <i class="fa-solid fa-triangle-exclamation"></i> Failed
        </p>

        <DataGrid
            :use-flex="true"
            v-for="data in latestData"
            v-if="!dataFetchFail"
        >
            <div>
                <p>{{ data.id }}</p>
            </div>
            <div>
                <p id="datatitle">
                    {{ dataType === 'user' ? data.username : data.title }}
                </p>
            </div>
            <div>
                <p>
                    {{
                        dataType === 'user'
                            ? data.join_date.split('T')[0]
                            : data.date.split('T')[0]
                    }}
                </p>
            </div>
        </DataGrid>
    </div>
</template>

<style lang="scss">
@import '../../assets/styles/base.scss';

#data-list {
    max-height: 300px;
    overflow-y: scroll;
}

#datatitle {
    max-width: 150px;
    @include textEllipsis();
}
</style>

<script lang="ts">
export default {
    data() {
        return {
            latestData: [] as any[],
            dataFetchFail: false,
        };
    },

    props: {
        dataType: String,
    },

    async created() {
        try {
            const data = await $fetch('/api/latestdata', {
                method: 'GET',

                query: {
                    data: this.dataType,
                },
            });

            if (data) {
                this.latestData = data;
            }
        } catch (e) {
            this.$showPopup({
                type: 'error',
                content: `Unable to retrieve data for ${this.dataType}`,
                isTimed: true,
            });
        }
    },
};
</script>
