//-- Functions

export default function generateThumbnail(
    document: Document,
    file: File,
): Promise<string> {
    return new Promise((res, rej) => {
        const videoElement = document.createElement('video');
        videoElement.setAttribute('src', URL.createObjectURL(file));

        videoElement.load();

        videoElement.addEventListener('loadedmetadata', () => {
            videoElement.addEventListener('canplay', () => {
                const canvasElement = document.createElement('canvas');
                canvasElement.width = 500;
                canvasElement.height = 500;

                const ctx = canvasElement.getContext('2d');

                ctx?.drawImage(
                    videoElement,
                    0,
                    0,
                    canvasElement.width,
                    canvasElement.height,
                );

                res(ctx?.canvas.toDataURL() || '');
            });
        });
    });
}

//--
