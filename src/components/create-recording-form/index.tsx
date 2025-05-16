import { useRef, useState } from 'react'
import { Button } from '@heroui/react'
import { Icon } from '@iconify/react'
import type { ChangeEvent, FormEvent } from 'react'
import { api } from 'convex/_generated/api'
import { useConvexMutation } from '@convex-dev/react-query'
import { useMutation } from '@tanstack/react-query'
import type { Id } from 'convex/_generated/dataModel'
import { useUploadFile } from '@convex-dev/r2/react'

interface FileUploadFormProps {
  sessionId: Id<'sessions'>
  onClose: () => void
}

export function CreateRecordingForm({
  sessionId,
  onClose,
}: FileUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [audioDuration, setAudioDuration] = useState<number>()
  const [uploading, setUploading] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null!)
  const fileInputRef = useRef<HTMLInputElement>(null!)
  const uploadFile = useUploadFile(api.functions.cloudflareR2)
  const createRecording = useMutation({
    mutationFn: useConvexMutation(api.functions.recordings.createRecording),
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setUploading(true)
    if (!selectedFile) return
    if (!audioDuration) return

    try {
      const key = await uploadFile(selectedFile)
      await createRecording.mutate({
        storageId: key,
        sessionId,
        durationSec: audioDuration,
      })

      setSelectedFile(null)
      fileInputRef.current.value = ''
      onClose()
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleLoadedMetadata = () => {
    const duration = audioRef.current.duration
    setAudioDuration(duration)
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
              <li key={index}>
                <p className="flex items-center gap-2">
                  <Icon icon="lucide:file" />
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
                <div>
                  <audio
                    controls
                    ref={audioRef}
                    onLoadedMetadata={handleLoadedMetadata}
                  >
                    <source src={URL.createObjectURL(file)} />
                  </audio>
                </div>
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
        isLoading={uploading}
        startContent={<Icon icon="lucide:upload" />}
      >
        Upload File
      </Button>
    </form>
  )
}
