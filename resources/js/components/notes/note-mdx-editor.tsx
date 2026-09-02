import {
    linkPlugin,
    listsPlugin,
    markdownShortcutPlugin,
    MDXEditor,
    type MDXEditorMethods,
    type MDXEditorProps,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import { forwardRef } from 'react';

const noteEditorPlugins = [
    listsPlugin(),
    linkPlugin(),
    markdownShortcutPlugin(),
];

const NoteMdxEditor = forwardRef<MDXEditorMethods, MDXEditorProps>(
    function NoteMdxEditor(props, ref) {
        return (
            <MDXEditor
                {...props}
                ref={ref}
                plugins={noteEditorPlugins}
                contentEditableClassName="note-mdx-editor-content"
            />
        );
    },
);

export default NoteMdxEditor;
