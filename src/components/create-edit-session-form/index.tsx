import { useConvexMutation } from '@convex-dev/react-query'
import { Button, DatePicker, Input } from '@heroui/react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { duotoneDark, duotoneLight } from '@uiw/codemirror-theme-duotone'
import { languages } from '@codemirror/language-data'
import {
  getLocalTimeZone,
  parseAbsoluteToLocal,
  type DateValue,
} from '@internationalized/date'
import { useMutation } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useState, type FormEvent } from 'react'
import { useTheme } from '@/hooks/use-theme'

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
  const { theme } = useTheme()

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
        <div
          className="group relative w-full inline-flex tap-highlight-transparent shadow-sm px-3 transition-background bg-default-100 hover:bg-default-200 focus-within:ring-2 focus-within:ring-primary/30 border-medium border-default-200 focus-within:border-primary rounded-medium flex-col items-start justify-center gap-0 transition-all duration-150 ease-in-out motion-reduce:transition-none flex-grow h-full min-h-0 overflow-hidden"
          role="textbox"
          aria-labelledby="notes-label"
        >
          <label
            id="notes-label"
            htmlFor="notes"
            className="block text-tiny font-medium text-default-600 mb-1.5"
          >
            Session Notes
          </label>
          <span id="notes-description" className="sr-only">
            Markdown editor for session notes. You can use Markdown formatting.
          </span>
          <CodeMirror
            id="notes"
            value={notes}
            height="100%"
            placeholder="Write session notes in Markdown"
            onChange={(value) => setNotes(value)}
            className="w-full h-full font-normal text-sm [&_.cm-editor]:bg-transparent [&_.cm-editor]:outline-none [&_.cm-content]:py-1 [&_.cm-gutters]:bg-transparent [&_.cm-focused]:outline-none [&_.cm-scroller]:!font-mono [&_.cm-activeLine]:bg-default-200/50 dark:[&_.cm-activeLine]:bg-default-100/50 [&_.cm-activeLineGutter]:bg-transparent dark:[&_.ͼo]:!text-default-300 dark:[&_.ͼb]:!text-primary-500 dark:[&_.ͼe]:!text-success-600 dark:[&_.ͼc]:!text-warning-500"
            extensions={[
              markdown({ base: markdownLanguage, codeLanguages: languages }),
            ]}
            theme={theme === 'dark' ? duotoneDark : duotoneLight}
            aria-label="Session Notes"
            aria-multiline="true"
            aria-describedby="notes-description"
            aria-required="false"
            tabIndex={0}
          />
        </div>
      </div>

      <div className="flex-shrink-0">
        <Button type="submit" color="primary" className="w-full">
          Add Session
        </Button>
      </div>
    </form>
  )
}
