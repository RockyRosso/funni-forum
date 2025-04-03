//-- Functions

async function generateDataUrl(
    element: HTMLElement,
    width: number,
    height: number,
) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = width || 0;
    canvas.height = height || 0;

    ctx?.drawImage(element, 0, 0, width, height);

    const dataUrl = canvas.toDataURL();

    return dataUrl;
}

async function uploadImage(
    element: HTMLImageElement,
    purpose: string,
    width: number,
    height: number,
) {
    const dataUrl = await generateDataUrl(element, width, height);

    if (purpose === 'user') {
        try {
            await $fetch('/api/user/personal/self', {
                method: 'PATCH',

                body: {
                    picture: dataUrl,
                },
            });
        } catch (e) {
            console.error(e);
        }
    }

    return dataUrl;
}

//--

export default defineNuxtPlugin(() => {
    return {
        provide: {
            uploadImage,
            generateDataUrl,
        },
    };
});
