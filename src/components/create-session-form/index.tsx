import { useConvexMutation } from '@convex-dev/react-query'
import { Button, DatePicker, Input, Textarea } from '@heroui/react'
// import { getLocalTimeZone, parseDate } from '@internationalized/date'
import { useMutation } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useState, type FormEvent } from 'react'

interface CreateSessionFormProps {
  campaignId: Id<'campaigns'>
  onClose: () => void
}

export function CreateSessionForm({
  campaignId,
  onClose,
}: CreateSessionFormProps) {
  const [name, setName] = useState('')
  const [date, setDate] = useState<any | null>(null)
  const [notes, setNotes] = useState('')
  const createSession = useMutation({
    mutationFn: useConvexMutation(api.functions.sessions.createSession),
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!date) {
      return
    }
    const isoDate = date ? date.toString() : ''
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
        required
      />

      <DatePicker
        id="date"
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
        required
      />

      <Button type="submit" color="primary">
        Add Session
      </Button>
    </form>
  )
}
