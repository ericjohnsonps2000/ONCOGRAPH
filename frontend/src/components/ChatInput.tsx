import { useState, KeyboardEvent } from 'react'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
}

function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-end space-x-3">
      <div className="flex-1 relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter your query about cancer biology..."
          disabled={disabled}
          rows={1}
          className="w-full px-4 py-3 bg-gray-900/80 border border-cyan-500/30 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-cyan-100 placeholder-cyan-400/60 font-mono backdrop-blur-sm shadow-lg shadow-cyan-500/10"
          style={{
            minHeight: '52px',
            maxHeight: '150px'
          }}
        />
      </div>
      <button
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-full p-3 transition-all duration-300 disabled:cursor-not-allowed flex-shrink-0 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 border border-cyan-400/20 hover:scale-105"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-lg"
        >
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22,2 15,22 11,13 2,9"></polygon>
        </svg>
      </button>
    </div>
  )
}

export default ChatInput