import { AudioLines, FolderPlus, Paperclip, SendHorizontal, Sparkles } from 'lucide-react'
import { useState } from 'react'

export function Composer() {
  const [value, setValue] = useState('')

  return (
    <form className="composer" onSubmit={event => event.preventDefault()}>
      <label className="sr-only" htmlFor="agent-prompt">
        Describe a task or goal for your agent
      </label>
      <textarea
        id="agent-prompt"
        value={value}
        onChange={event => setValue(event.target.value)}
        placeholder="Describe a task or goal for your agent…"
        rows={2}
      />
      <div className="composer__toolbar">
        <div className="composer__tools">
          <button className="icon-button" type="button" aria-label="Attach file">
            <Paperclip size={17} />
          </button>
          <button className="icon-button" type="button" aria-label="Add folder context">
            <FolderPlus size={17} />
          </button>
          <button className="icon-button" type="button" aria-label="Use agent tools">
            <Sparkles size={17} />
          </button>
        </div>
        <div className="composer__actions">
          <button className="icon-button" type="button" aria-label="Voice input">
            <AudioLines size={18} />
          </button>
          <button className="send-button" type="submit" aria-label="Send prompt">
            <SendHorizontal size={18} />
          </button>
        </div>
      </div>
    </form>
  )
}
