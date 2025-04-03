<template>
    <div class="header">
        <div class="btn-scroll">
            <a
                href="/admin/"
                style="font-size: 25px"
                class="button no-min-width pad-10"
                data-btn-style="secondary"
                ><i class="fa-solid fa-house"></i> Home</a
            >
            <a
                href="/admin/users"
                style="font-size: 25px"
                class="button no-min-width pad-10"
                data-btn-style="secondary"
                ><i class="fa-solid fa-user"></i> Users</a
            >
            <button
                href="/admin/posts"
                style="font-size: 25px"
                class="no-min-width pad-10"
                data-btn-style="secondary"
                disabled=""
            >
                <i class="fa-solid fa-file"></i> Posts (Coming Soon)
            </button>
        </div>
    </div>
</template>

<style src="~/assets/styles/components/adminHeader.scss" />
