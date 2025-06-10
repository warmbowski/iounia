import CodeMirror from '@uiw/react-codemirror'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { gruvboxDark, gruvboxLight } from '@uiw/codemirror-theme-gruvbox-dark'

import { languages } from '@codemirror/language-data'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  label: string
  descriptionId: string
  placeholder: string
  id: string
  isRequired?: boolean
  className?: string
  theme?: string
}

/**
 * Markdown editor component for editing text in Markdown format.
 * NOTE: DO NOT import on server-side, it will break SSR.
 *       Lazy load this component on SSR routes.
 * @param param0 - Props for the Markdown editor.
 * @returns JSX.Element
 */
export default function MarkdownEditor({
  value,
  onChange,
  label,
  descriptionId,
  placeholder,
  id,
  isRequired = false,
  className = '',
  theme = 'light',
}: MarkdownEditorProps) {
  const isDark = theme === 'dark'

  return (
    <CodeMirror
      className={className}
      id={id}
      value={value}
      placeholder={placeholder}
      height="100%"
      onChange={onChange}
      theme={isDark ? gruvboxDark : gruvboxLight}
      extensions={[
        markdown({ base: markdownLanguage, codeLanguages: languages }),
      ]}
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
  )
}
