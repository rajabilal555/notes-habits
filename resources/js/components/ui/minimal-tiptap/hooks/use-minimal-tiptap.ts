import * as React from "react"
import type { Editor } from "@tiptap/react"
import type { Content, UseEditorOptions } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { useEditor } from "@tiptap/react"
import { Typography } from "@tiptap/extension-typography"
import { TextStyle } from "@tiptap/extension-text-style"
import { Placeholder, Selection } from "@tiptap/extensions"
import { Markdown } from "@tiptap/markdown"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TableKit } from "@tiptap/extension-table"
import {
  Image,
  HorizontalRule,
  CodeBlockLowlight,
  Color,
  UnsetAllMarks,
  ResetMarksOnEnter,
  FileHandler,
  MarkdownPaste,
} from "../extensions"
import { cn } from "@/lib/utils"
import { fileToBase64, getOutput, randomId } from "../utils"
import { useThrottle } from "../hooks/use-throttle"
import { toast } from "sonner"

export interface UseMinimalTiptapEditorProps extends UseEditorOptions {
  value?: Content
  output?: "html" | "json" | "text" | "markdown"
  placeholder?: string
  editorClassName?: string
  throttleDelay?: number
  onUpdate?: (content: Content) => void
  onBlur?: (content: Content) => void
  uploader?: (file: File) => Promise<string>
}

async function fakeuploader(file: File): Promise<string> {
  return fileToBase64(file)
}

function insertImageNodes(
  editor: Editor,
  files: File[],
  pos: number,
): void {
  editor.commands.insertContentAt(
    pos,
    files.map((image) => {
      const blobUrl = URL.createObjectURL(image)
      const id = randomId()

      return {
        type: "image",
        attrs: {
          id,
          src: blobUrl,
          alt: image.name,
          title: image.name,
          fileName: image.name,
        },
      }
    }),
  )
}

export const createMinimalTiptapExtensions = ({
  placeholder = "",
  uploader,
  output = "json",
}: {
  placeholder?: string
  uploader?: (file: File) => Promise<string>
  output?: UseMinimalTiptapEditorProps["output"]
} = {}) => [
  StarterKit.configure({
    blockquote: { HTMLAttributes: { class: "block-node" } },
    // bold
    bulletList: { HTMLAttributes: { class: "list-node" } },
    code: { HTMLAttributes: { class: "inline", spellcheck: "false" } },
    codeBlock: false,
    // document
    dropcursor: { width: 2, class: "ProseMirror-dropcursor border" },
    // gapcursor
    // hardBreak
    heading: { HTMLAttributes: { class: "heading-node" } },
    // undoRedo
    horizontalRule: false,
    // italic
    // listItem
    // listKeymap
    link: {
      enableClickSelection: true,
      openOnClick: false,
      HTMLAttributes: {
        class: "link",
      },
    },
    orderedList: { HTMLAttributes: { class: "list-node" } },
    paragraph: { HTMLAttributes: { class: "text-node" } },
    // strike
    // text
    // underline
    // trailingNode
  }),
  
  Image.configure({
    allowedMimeTypes: ["image/*"],
    maxFileSize: 5 * 1024 * 1024,
    allowBase64: true,
    uploadFn: async (file) => {
      return uploader ? await uploader(file) : await fakeuploader(file)
    },
    onToggle(editor, files, pos) {
      insertImageNodes(editor, files, pos)
    },
    onImageRemoved() {},
    onValidationError(errors) {
      errors.forEach((error) => {
        toast.error("Image validation error", {
          position: "bottom-right",
          description: error.reason,
        })
      })
    },
    onActionSuccess({ action }) {
      const mapping = {
        copyImage: "Copy Image",
        copyLink: "Copy Link",
        download: "Download",
      }
      toast.success(mapping[action], {
        position: "bottom-right",
        description: "Image action success",
      })
    },
    onActionError(error, { action }) {
      const mapping = {
        copyImage: "Copy Image",
        copyLink: "Copy Link",
        download: "Download",
      }
      toast.error(`Failed to ${mapping[action]}`, {
        position: "bottom-right",
        description: error.message,
      })
    },
  }),
  FileHandler.configure({
    allowBase64: true,
    allowedMimeTypes: ["image/*"],
    maxFileSize: 5 * 1024 * 1024,
    onDrop: (editor, files, pos) => {
      insertImageNodes(editor, files, pos)
    },
    onPaste: (editor, files) => {
      insertImageNodes(editor, files, editor.state.selection.from)
    },
    onValidationError: (errors) => {
      errors.forEach((error) => {
        toast.error("Image validation error", {
          position: "bottom-right",
          description: error.reason,
        })
      })
    },
  }),
  Color,
  TextStyle,
  Selection,
  Typography,
  UnsetAllMarks,
  HorizontalRule,
  ResetMarksOnEnter,
  CodeBlockLowlight,
  Placeholder.configure({ placeholder: () => placeholder }),
  TaskList.configure({
    HTMLAttributes: { class: "task-list-node" },
  }),
  TaskItem.configure({
    nested: true,
  }),
  // Add MarkdownPaste extension when output is markdown
  ...(output === "markdown" ? [
    // Markdown with GFM support for tables, task lists, etc.
    Markdown.configure({
      markedOptions: {
        gfm: true,
      },
    }),
    // Tables
    TableKit.configure({
      table: {
        resizable: true,
        HTMLAttributes: { class: "table-node" },
      },
    }),
    MarkdownPaste
  ] : []),
]

export const useMinimalTiptapEditor = ({
  value,
  output = "html",
  placeholder = "",
  editorClassName,
  throttleDelay = 0,
  onUpdate,
  onBlur,
  uploader,
  ...props
}: UseMinimalTiptapEditorProps) => {
  const throttledSetValue = useThrottle(
    (value: Content) => onUpdate?.(value),
    throttleDelay
  )

  const handleUpdate = React.useCallback(
    (editor: Editor) => throttledSetValue(getOutput(editor, output)),
    [output, throttledSetValue]
  )

  const handleCreate = React.useCallback(
    (editor: Editor) => {
      if (value && editor.isEmpty) {
        editor.commands.setContent(value, {
          contentType: output === "markdown" ? "markdown" : undefined,
        })
      }
    },
    [value, output]
  )

  const handleBlur = React.useCallback(
    (editor: Editor) => onBlur?.(getOutput(editor, output)),
    [output, onBlur]
  )

  const extensions = React.useMemo(
    () => createMinimalTiptapExtensions({ placeholder, uploader, output }),
    [placeholder, uploader, output]
  )

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        class: cn("focus:outline-hidden", editorClassName),
      },
    },
    onUpdate: ({ editor }) => handleUpdate(editor),
    onCreate: ({ editor }) => handleCreate(editor),
    onBlur: ({ editor }) => handleBlur(editor),
    ...props,
  })

  return editor
}

export default useMinimalTiptapEditor
