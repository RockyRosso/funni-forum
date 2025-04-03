//-- Variables

type popupOptions = {
    type: string;
    content: string;
    isTimed?: boolean;
};

//--

export default defineNuxtPlugin(() => {
    return {
        provide: {
            showPopup(popupOptions: popupOptions) {
                const { $event } = useNuxtApp();

                $event('showPopup', popupOptions);
            },
        },
    };
});
