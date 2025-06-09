import { useConvexMutation } from '@convex-dev/react-query'
import { Button, DatePicker, Input } from '@heroui/react'
import {
  getLocalTimeZone,
  parseAbsoluteToLocal,
  type DateValue,
} from '@internationalized/date'
import { useMutation } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useState, type FormEvent } from 'react'
import { MarkdownInput } from '@/components/markdown-input'

interface CreateEditSessionFormProps {
  campaignId: Id<'campaigns'>
  session?: Doc<'sessions'>
  onClose: () => void
}

export function CreateEditSessionForm({
  campaignId,
  session,
  onClose,
}: CreateEditSessionFormProps) {
  const [name, setName] = useState(session?.name || '')
  const [date, setDate] = useState<DateValue | null>(
    session?.date ? parseAbsoluteToLocal(session.date) : null,
  )
  const [notes, setNotes] = useState(session?.notes || '')

  const createSession = useMutation({
    mutationFn: useConvexMutation(api.functions.sessions.createSession),
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!date) {
      return
    }
    const isoDate = date ? date.toDate(getLocalTimeZone()).toISOString() : ''
    await createSession.mutate({
      campaignId,
      name,
      date: isoDate,
      notes,
    })

    setName('')
    setDate(null)
    setNotes('')
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full p-6">
      <div className="space-y-4 flex-shrink-0">
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter session name"
          label="Session Name"
          isRequired
          autoFocus
          autoComplete="off"
        />

        <DatePicker
          id="date"
          granularity="day"
          value={date}
          onChange={setDate}
          label="Session Date"
          isRequired
        />
      </div>

      <div className="flex flex-col flex-grow min-h-0 mt-4 mb-4">
        <MarkdownInput
          id="notes"
          className="flex-grow h-full"
          value={notes}
          onChange={setNotes}
          label="Session Notes"
          placeholder="Write session notes in Markdown"
        />
      </div>

      <div className="flex-grow-0">
        <Button type="submit" color="primary">
          Add Session
        </Button>
      </div>
    </form>
  )
}
