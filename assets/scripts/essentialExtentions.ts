//-- Variables

import { Mark, type Extensions, Node, type MarkConfig } from '@tiptap/core';

import { type BoldOptions } from '@tiptap/extension-bold';
import { type ItalicOptions } from '@tiptap/extension-italic';

import { Paragraph } from '@tiptap/extension-paragraph';
import History from '@tiptap/extension-history';
import ListItem from '@tiptap/extension-list-item';
import OrderedList from '@tiptap/extension-ordered-list';
import BulletList from '@tiptap/extension-bullet-list';
import Link from '@tiptap/extension-link';

//--

//-- Functions

function createHeadings() {
    const headings: Node[] = [];
    for (let i = 1; i < 4; i++) {
        const heading = Node.create({
            name: `heading${i}`,
            group: 'block',
            content: 'inline*',

            addKeyboardShortcuts() {
                return {
                    [`Ctrl-Alt-${i}`]: ({ editor }) => {
                        editor.commands.setNode(`heading${i}`);
                        return true;
                    },
                };
            },

            renderHTML(props) {
                return [`h${i}`, 0];
            },
        });

        headings.push(heading);
    }

    return headings;
}

function createMarks() {
    const marks: Mark[] = [];

    const boldMark: Mark<BoldOptions, any> = Mark.create({
        name: 'bold',

        renderHTML: () => {
            return ['strong', 0];
        },
    });

    const italicMark: Mark<ItalicOptions, any> = Mark.create({
        name: 'italic',

        renderHTML: () => {
            return ['i', 0];
        },
    });

    const underlineMark: Mark<MarkConfig, any> = Mark.create({
        name: 'underline',

        renderHTML: () => {
            return ['u', 0];
        },
    });

    const strikeMark: Mark<MarkConfig, any> = Mark.create({
        name: 'strike',

        renderHTML: () => {
            return ['s', 0];
        },
    });

    marks.push(boldMark, italicMark, underlineMark, strikeMark);

    return marks;
}

export function createExtentions() {
    const extentions: Extensions = [];

    const mainNode = Node.create({
        name: 'doc',
        topNode: true,
        content: 'block+',
    });

    const textNode = Node.create({
        name: 'text',
        group: 'inline',
    });

    const linkNode = Link.configure({
        autolink: true,
    });

    const paragraph = Paragraph.extend({

        addKeyboardShortcuts() {
            return {
                ['Ctrl-b']: ({ editor }) => {
                    editor.commands.toggleMark('bold');
                    return true;
                },

                ['Ctrl-i']: ({ editor }) => {
                    editor.commands.toggleMark('italic');
                    return true;
                },

                ['Ctrl-u']: ({ editor }) => {
                    editor.commands.toggleMark('underline');
                    return true;
                },

                ['Ctrl-Shift-s']: ({ editor }) => {
                    editor.commands.toggleMark('strike');
                    return true;
                },
            };
        },
    });

    const history = History.extend({
        addKeyboardShortcuts() {
            return {
                ['Ctrl-z']: ({ editor }) => {
                    editor.commands.undo();
                    return true;
                },

                ['Ctrl-y']: ({ editor }) => {
                    editor.commands.redo();
                    return true;
                },

                ['Ctrl-Shift-z']: ({ editor }) => {
                    editor.commands.redo();
                    return true;
                },
            };
        },
    });

    const marks = createMarks();
    const headings = createHeadings();

    extentions.push(mainNode);
    extentions.push(textNode, linkNode);

    extentions.push(paragraph);

    extentions.push(history);

    extentions.push(ListItem, OrderedList, BulletList);

    for (let i = 0; i < marks.length; i++) {
        extentions.push(marks[i]);
    }

    for (let h = 0; h < headings.length; h++) {
        extentions.push(headings[h]);
    }

    return extentions;
}

//--
