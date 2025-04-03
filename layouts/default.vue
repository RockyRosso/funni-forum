<template>
    <div>
        <header>
            <Siteheader />
        </header>

        <div>
            <slot />
        </div>

        <footer>
            <LazyPopup />
        </footer>
    </div>
</template>
