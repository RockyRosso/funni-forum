export default defineNuxtPlugin(() => {
    return {
        provide: {
            showModal(modalName: string, modalOptions?: any) {
                const { $event } = useNuxtApp();

                $event(`showModal_${modalName}`, modalOptions);
            },
        },
    };
});
