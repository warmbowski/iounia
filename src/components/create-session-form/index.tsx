import { useConvexMutation } from '@convex-dev/react-query'
import { Button, DatePicker, Input, Textarea } from '@heroui/react'
import {
  getLocalTimeZone,
  parseAbsoluteToLocal,
  type DateValue,
} from '@internationalized/date'
import { useMutation } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useState, type FormEvent } from 'react'

interface CreateSessionFormProps {
  campaignId: Id<'campaigns'>
  session?: Doc<'sessions'>
  onClose: () => void
}

export function CreateSessionForm({
  campaignId,
  session,
  onClose,
}: CreateSessionFormProps) {
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
    const isoDate = date ? date?.toDate(getLocalTimeZone()).toISOString() : ''
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
    <form onSubmit={handleSubmit} className="space-y-4 p-6">
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

      <Textarea
        id="notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Enter session notes"
        label="Session Notes"
      />

      <Button type="submit" color="primary">
        Add Session
      </Button>
    </form>
  )
}
