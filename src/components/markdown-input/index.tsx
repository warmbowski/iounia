import { useTheme } from '@/hooks/use-theme'
import CodeMirror from '@uiw/react-codemirror'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { duotoneDark, duotoneLight } from '@uiw/codemirror-theme-duotone'
import { languages } from '@codemirror/language-data'
import { THEME_LS_KEY } from '@/constants'

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
  const isDark = theme === 'dark'
  const labelId = `${id}-label`
  const descriptionId = `${id}-description`

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
        <CodeMirror
          id={id}
          value={value}
          height="100%"
          placeholder={placeholder}
          onChange={onChange}
          className="w-full h-full font-normal text-sm [&_.cm-editor]:bg-transparent [&_.cm-editor]:outline-none [&_.cm-content]:py-1 [&_.cm-gutters]:bg-transparent [&_.cm-focused]:outline-none [&_.cm-scroller]:!font-mono [&_.cm-activeLine]:bg-default-200/50 dark:[&_.cm-activeLine]:bg-default-100/50 [&_.cm-activeLineGutter]:bg-transparent dark:[&_.ͼo]:!text-default-300 dark:[&_.ͼb]:!text-primary-500 dark:[&_.ͼe]:!text-success-600 dark:[&_.ͼc]:!text-warning-500"
          extensions={[
            markdown({ base: markdownLanguage, codeLanguages: languages }),
          ]}
          theme={isDark ? duotoneDark : duotoneLight}
          basicSetup={{
            lineNumbers: false,
            highlightActiveLine: false,
            highlightActiveLineGutter: false,
            foldGutter: false,
          }}
          aria-label={label}
          aria-multiline="true"
          aria-describedby={descriptionId}
          aria-required={isRequired ? 'true' : 'false'}
          tabIndex={0}
        />
      </div>
    </div>
  )
}
