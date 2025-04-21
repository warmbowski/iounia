import { useRef, useState } from 'react'
import { Button, Input } from '@heroui/react'
import { Icon } from '@iconify/react'
import type { ChangeEvent, FormEvent } from 'react'

interface FileUploadFormProps {
  onClose: () => void
}

export function FileUploadForm({ onClose }: FileUploadFormProps) {
  const [files, setFiles] = useState<FileList | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (files) {
      // Handle file upload logic here
      console.log('Uploading files:', files)
      onClose()
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div
        className="border-2 border-dashed border-default-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <Icon
          icon="lucide:upload-cloud"
          className="w-12 h-12 mx-auto mb-4 text-default-400"
        />
        <p className="text-default-600">
          Click to upload or drag and drop files here
        </p>
        <p className="text-small text-default-400 mt-2">
          Supported formats: MP3, WAV, AIFF, ACC, OGG, FLAC
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
          accept=".mp3,.wav,.aiff,.aac,.ogg,.flac"
        />
      </div>

      {files && (
        <div className="mt-4">
          <p className="text-small font-medium mb-2">Selected files:</p>
          <ul className="text-small text-default-500">
            {Array.from(files).map((file, index) => (
              <li key={index} className="flex items-center gap-2">
                <Icon icon="lucide:file" />
                {file.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button
        type="submit"
        color="primary"
        className="mt-4"
        isDisabled={!files}
        startContent={<Icon icon="lucide:upload" />}
      >
        Upload Files
      </Button>
    </form>
  )
}
