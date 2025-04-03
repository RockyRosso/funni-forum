//-- Variables

import type { Schema } from 'prosemirror-model';

import {
    chainCommands,
    exitCode,
    setBlockType,
    toggleMark,
} from 'prosemirror-commands';
import { undo, redo } from 'prosemirror-history';
import { undoInputRule } from 'prosemirror-inputrules';

//--

//-- Functions

export function initializeKeymap(schema: Schema) {
    return {
        ['Enter']: chainCommands(exitCode, (editorState, dispatch) => {
            if (!dispatch) return false;

            dispatch(
                editorState.tr
                    .replaceSelectionWith(schema.nodes.hard_break.create())
                    .scrollIntoView(),
            );

            return true;
        }),

        ['Shift-Ctrl-1']: setBlockType(schema.nodes.heading),
        ['Shift-Ctrl-0']: setBlockType(schema.nodes.paragraph),

        ['Ctrl-z']: undo,
        ['Ctrl-Shift-r']: redo,

        ['Backspace']: undoInputRule,
    };
}

//--
