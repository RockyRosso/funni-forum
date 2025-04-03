//-- Variables

import abbreviationConvert from './abbreviationConvert';

type postPreviewOptions = {
    id: string;
    title: string;

    username: string;
    picture: string;

    postDate: string;

    likes: number;
    replies: number;
};

//--

//-- Functions

export function createMediaProcessing() {
    return `
    <div class="section noshadow" style="padding: 50px;">
        <p>Media is being processed...</p>
    </div>`;
}

export function createFilePreview(src: string, id: string) {
    return `
    <div id="${id}">
        <button data-btn-style="text-only" class="mv-file-container">
            <img class="mv-file" src="${src}" />
        </button>
    </div>`;
}

export function createVideoPlayer(src: string) {
    return `
    <video controls id="video-player" class="video-js vjs-default-skin">
        <source src="${src}" type="video/mp4" />
    </video>
    `;
}

//--
