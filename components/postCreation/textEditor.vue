<template>
    <div id="text-style-options" style="text-align: start">
        <button data-styling-type="bold" class="text-style">
            <strong>B</strong>
        </button>
        <button data-styling-type="italic" class="text-style"><i>I</i></button>
        <button data-styling-type="underline" class="text-style">
            <u>U</u>
        </button>
        <button data-styling-type="strike" class="text-style"><s>S</s></button>

        <button
            data-is-node="true"
            data-styling-type="heading1"
            class="text-style"
        >
            H1
        </button>
        <button
            data-is-node="true"
            data-styling-type="heading2"
            class="text-style"
        >
            H2
        </button>
        <button
            data-is-node="true"
            data-styling-type="heading3"
            class="text-style"
        >
            H3
        </button>

        <button data-styling-type="bulletList" class="text-style">
            <i class="fa-solid fa-list-ul"></i>
        </button>
        <button data-styling-type="orderedList" class="text-style">
            <i class="fa-solid fa-list-ol"></i>
        </button>
    </div>

    <div>
        <div class="prosemirror-textbox"></div>
    </div>
</template>

<script lang="ts">
import { Editor } from '@tiptap/core';
import { createExtentions } from '~/assets/scripts/essentialExtentions';

let editor: Editor | null = null;

export default {
    methods: {
        handleTextStyle() {
            const textStyleOptions = $('.text-style');

            textStyleOptions.on('click', (event: JQuery.ClickEvent) => {
                let textStyleOption: Element = event.target;

                let stylingOption =
                    textStyleOption.attributes.getNamedItem(
                        'data-styling-type',
                    )?.value;

                if (!stylingOption) {
                    if (!textStyleOption.parentElement) return;

                    textStyleOption = textStyleOption.parentElement;
                    stylingOption =
                        textStyleOption.attributes.getNamedItem(
                            'data-styling-type',
                        )?.value;
                }

                if (!editor) return;
                if (!stylingOption) return;
                if (!editor.schema.marks[stylingOption])
                    console.log(editor.commands.focus());

                if (textStyleOption.attributes.getNamedItem('data-is-node')) {
                    editor.commands.setNode(stylingOption);
                    return;
                }

                if (stylingOption === 'bulletList') {
                    editor.commands.toggleBulletList();
                    return;
                } else if (stylingOption === 'orderedList') {
                    editor.commands.toggleOrderedList();
                    return;
                }

                editor.commands.toggleMark(stylingOption);
            });
        },

        updateStylingButtons(state: Editor) {
            const storedMarks = [
                'underline',
                'bold',
                'strike',
                'italic',
                'heading1',
                'heading2',
                'heading3',
                'orderedList',
                'bulletList',
            ];

            $('.text-style').removeClass('selected');

            for (let i = 0; i < storedMarks?.length; i++) {
                const stylingButton = $(
                    `[data-styling-type='${storedMarks[i]}']`,
                );

                if (state.isActive(storedMarks[i])) {
                    stylingButton.addClass('selected');
                }
            }
        },
    },

    mounted() {
        const textbox = $('.prosemirror-textbox');
        const extensions = createExtentions();

        const postDataState = usePostData();

        let editorContent = '';

        try {
            editorContent = JSON.parse(postDataState.postContent);
        } catch (e) {
            console.error(e);

            editorContent = '';
        }

        console.log(editorContent);

        editor = new Editor({
            element: textbox[0],
            extensions,
            content: editorContent,
            parseOptions: {
                preserveWhitespace: 'full',
            },
        });

        editor.on('transaction', ({ editor }) => {
            this.updateStylingButtons(editor);

            postDataState.modify(
                'postContent',
                JSON.stringify(editor.getJSON()),
            );
        });

        this.handleTextStyle();
    },

    beforeUnmount() {
        const postDataState = usePostData();

        if (editor?.getJSON()) {
            postDataState.modify(
                'postContent',
                JSON.stringify(editor.getJSON()),
            );
        }

        editor?.destroy();
    },
};
</script>
../../assets/scripts/essentialExtentions
