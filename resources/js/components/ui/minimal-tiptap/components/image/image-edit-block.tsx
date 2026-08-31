import * as React from "react"
import type { Editor } from "@tiptap/react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { fileToBase64 } from "../../utils"
import type { UploadReturnType } from "../../extensions/image/image"

interface ImageEditBlockProps {
  editor: Editor
  close: () => void
}

function resolveUploadResult(result: UploadReturnType): string {
  return typeof result === "string" ? result : result.src
}

export const ImageEditBlock: React.FC<ImageEditBlockProps> = ({
  editor,
  close,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [link, setLink] = React.useState("")

  const handleClick = React.useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFile = React.useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files?.length) {
        return
      }

      const uploadFn = editor.extensionManager.extensions.find(
        (extension) => extension.name === "image",
      )?.options.uploadFn as
        | ((file: File, editor: Editor) => Promise<UploadReturnType>)
        | undefined

      const contentBucket = await Promise.all(
        Array.from(files).map(async (file) => {
          if (uploadFn) {
            return { src: resolveUploadResult(await uploadFn(file, editor)) }
          }

          return { src: await fileToBase64(file) }
        }),
      )

      editor.commands.setImages(contentBucket)
      close()
    },
    [editor, close],
  )

  const handleSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      e.stopPropagation()

      if (link) {
        editor.commands.setImages([{ src: link }])
        close()
      }
    },
    [editor, link, close],
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <Label htmlFor="image-link">Attach an image link</Label>
        <div className="flex">
          <Input
            id="image-link"
            type="url"
            required
            placeholder="https://example.com"
            value={link}
            className="grow"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setLink(e.target.value)
            }
          />
          <Button type="submit" className="ml-2">
            Submit
          </Button>
        </div>
      </div>
      <Button type="button" className="w-full" onClick={handleClick}>
        Upload from your computer
      </Button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        multiple
        className="hidden"
        onChange={handleFile}
      />
    </form>
  )
}

export default ImageEditBlock
