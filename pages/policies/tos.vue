<template>
    <LayoutContainer>
        <ContentDoc v-slot="{ doc }">
            <article class="section padding transparent textleft">
                <ContentRenderer :value="doc" />
            </article>
        </ContentDoc>
    </LayoutContainer>
</template>
