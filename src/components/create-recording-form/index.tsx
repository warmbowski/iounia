import { useRef, useState } from 'react'
import { Button } from '@heroui/react'
import { Icon } from '@iconify/react'
import type { ChangeEvent, FormEvent } from 'react'
import { api } from 'convex/_generated/api'
import { useConvexMutation } from '@convex-dev/react-query'
import { useMutation } from '@tanstack/react-query'
import type { Id } from 'convex/_generated/dataModel'

interface FileUploadFormProps {
  sessionId: Id<'sessions'>
  onClose: () => void
}

export function CreateRecordingForm({
  sessionId,
  onClose,
}: FileUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const generateUploadUrl = useMutation({
    mutationFn: useConvexMutation(api.functions.recordings.generateUploadUrl),
  })
  const createRecording = useMutation({
    mutationFn: useConvexMutation(api.functions.recordings.createRecording),
  })
  const fileInputRef = useRef<HTMLInputElement>(null!)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Step 1: Get a short-lived upload URL
    const postUrl = await generateUploadUrl.mutateAsync({})
    // Step 2: POST the file to the URL
    const result = await fetch(postUrl, {
      method: 'POST',
      headers: { 'Content-Type': selectedFile!.type },
      body: selectedFile,
    })
    const { storageId } = await result.json()
    // Step 3: Save the newly allocated storage id to the database
    await createRecording.mutate({ storageId, sessionId })

    setSelectedFile(null)
    fileInputRef.current.value = ''
    onClose()
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0])
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

      {selectedFile && (
        <div className="mt-4">
          <p className="text-small font-medium mb-2">Selected files:</p>
          <ul className="text-small text-default-500">
            {Array.from([selectedFile]).map((file, index) => (
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
        isDisabled={!selectedFile}
        startContent={<Icon icon="lucide:upload" />}
      >
        Upload Files
      </Button>
    </form>
  )
}
