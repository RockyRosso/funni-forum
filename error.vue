<template>
    <Title>Error {{ error.statusCode }}</Title>

    <header>
        <Siteheader />
    </header>

    <LayoutContainer>
        <div class="error-wrapper">
            <div>
                <h1 style="font-size: 200px">{{ error.statusCode }}</h1>
            </div>
            <p>{{ error.statusMessage }}</p>
        </div>
    </LayoutContainer>
</template>

<style lang="scss">
.error-wrapper {
    position: relative;
    top: 20%;

    text-align: center;
}

h1 {
    margin: 0;
}
</style>

<script lang="ts">
export default {
    props: {
        error: Object,
    },
};
</script>
