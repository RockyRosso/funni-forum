import { LazyModalsConfirmPrompt } from '#build/components';
<template>
    <Title>Admin Panel</Title>

    <div>
        <header>
            <Siteheader style="margin-bottom: 0" />
            <AdminHeader />
        </header>

        <div class="modals">
            <LazyModalsChangeRole />
            <LazyModalsChangeUsername />
            <LazyModalsConfirmPrompt />

            <LazyModalsInfo />
        </div>

        <LayoutContainer>
            <div class="section flex-center transparent noshadow">
                <slot />
            </div>
        </LayoutContainer>

        <footer>
            <LazyPopup />
        </footer>
    </div>
</template>
