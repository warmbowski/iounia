import { lazy, Suspense } from 'react'
import { useTheme } from '@/hooks/use-theme'
import { THEME_LS_KEY } from '@/constants'
import { Textarea } from '@heroui/react'

const MarkdownEditor = lazy(() => import('./editor'))

interface MarkdownInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  id?: string
  isRequired?: boolean
  className?: string
}

export function MarkdownInput({
  value,
  onChange,
  label = 'Notes',
  placeholder = 'Write in Markdown',
  id = 'markdown-editor',
  isRequired = false,
  className = '',
}: MarkdownInputProps) {
  const { theme } = useTheme(undefined, THEME_LS_KEY)
  const labelId = `${id}-label`
  const descriptionId = `${id}-description`

  const fallbackEditor = (
    <Textarea
      id="notes"
      className="flex-grow-1"
      classNames={{
        inputWrapper: 'flex-grow-1',
      }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      label={label}
      placeholder={placeholder}
    />
  )

  return (
    <div className={`flex flex-col ${className}`}>
      <div
        className="group relative w-full inline-flex tap-highlight-transparent shadow-sm px-3 py-2 transition-background bg-default-100 hover:bg-default-200 focus-within:ring-2 focus-within:ring-primary/30 border-medium border-default-200 focus-within:border-primary rounded-medium flex-col items-start justify-center gap-0 transition-all duration-150 ease-in-out motion-reduce:transition-none flex-grow h-full min-h-0 overflow-hidden"
        role="textbox"
        aria-labelledby={labelId}
      >
        <label
          id={labelId}
          htmlFor={id}
          className="block text-tiny font-medium text-default-600 mb-1.5"
        >
          {label}
          {isRequired && <span className="text-danger"> *</span>}
        </label>
        <span id={descriptionId} className="sr-only">
          Markdown editor for {label.toLowerCase()}. You can use Markdown
          formatting.
        </span>
        <Suspense fallback={fallbackEditor}>
          <MarkdownEditor
            className="w-full h-full font-normal text-sm [&_.cm-editor]:bg-transparent [&_.cm-editor]:outline-none [&_.cm-content]:py-1 [&_.cm-gutters]:bg-transparent [&_.cm-focused]:outline-none [&_.cm-scroller]:!font-mono [&_.cm-activeLine]:bg-default-200/50 dark:[&_.cm-activeLine]:bg-default-100/50 [&_.cm-activeLineGutter]:bg-transparent dark:[&_.ͼo]:!text-default-300 dark:[&_.ͼb]:!text-primary-500 dark:[&_.ͼe]:!text-success-600 dark:[&_.ͼc]:!text-warning-500"
            id={id}
            value={value}
            label={label}
            descriptionId={descriptionId}
            placeholder={placeholder}
            onChange={onChange}
            theme={theme}
          />
        </Suspense>
      </div>
    </div>
  )
}
