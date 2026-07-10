import { AudioLines, FolderPlus, Paperclip, SendHorizontal, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type ComposerProps = {
  focusRequest: number
  isBusy: boolean
  onSubmit: (prompt: string) => Promise<void>
  onPickContext: (kind: 'files' | 'folder') => Promise<void>
}

export function Composer({ focusRequest, isBusy, onSubmit, onPickContext }: ComposerProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (focusRequest > 0) {
      textareaRef.current?.focus()
    }
  }, [focusRequest])

  const submit = async () => {
    const prompt = value.trim()

    if (!prompt || isBusy) {
      return
    }

    try {
      await onSubmit(prompt)
      setValue('')
    } catch {
      // The application-level error banner presents backend failures.
    }
  }

  return (
    <form
      className="composer"
      onSubmit={event => {
        event.preventDefault()
        void submit()
      }}
    >
      <label className="sr-only" htmlFor="agent-prompt">
        Describe a task or goal for your agent
      </label>
      <textarea
        ref={textareaRef}
        id="agent-prompt"
        value={value}
        onChange={event => setValue(event.target.value)}
        placeholder="Describe a task or goal for your agent…"
        rows={2}
        onKeyDown={event => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            void submit()
          }
        }}
      />
      <div className="composer__toolbar">
        <div className="composer__tools">
          <button
            className="icon-button"
            type="button"
            aria-label="Attach file"
            disabled={isBusy}
            onClick={() => void onPickContext('files').catch(() => undefined)}
          >
            <Paperclip size={17} />
          </button>
          <button
            className="icon-button"
            type="button"
            aria-label="Add folder context"
            disabled={isBusy}
            onClick={() => void onPickContext('folder').catch(() => undefined)}
          >
            <FolderPlus size={17} />
          </button>
          <button className="icon-button" type="button" aria-label="Agent tools are selected automatically" disabled>
            <Sparkles size={17} />
          </button>
        </div>
        <div className="composer__actions">
          <button className="icon-button" type="button" aria-label="Voice input is unavailable" disabled>
            <AudioLines size={18} />
          </button>
          <button
            className="send-button"
            type="submit"
            aria-label="Send prompt"
            disabled={isBusy || value.trim().length === 0}
          >
            <SendHorizontal size={18} />
          </button>
        </div>
      </div>
    </form>
  )
}
