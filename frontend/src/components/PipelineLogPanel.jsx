import { useEffect, useRef, useState } from 'react'
import { X, Lock, Unlock } from 'lucide-react'

const levelColors = {
  INFO: 'text-blue-400',
  WARNING: 'text-yellow-400',
  ERROR: 'text-red-400',
}

export default function PipelineLogPanel({ messages, open, onClose, title }) {
  const [scrollLock, setScrollLock] = useState(false)
  const bottomRef = useRef()
  const containerRef = useRef()

  useEffect(() => {
    if (!scrollLock && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, scrollLock])

  if (!open) return null

  return (
    <div className="fixed bottom-0 right-0 w-full md:w-[600px] z-40 card rounded-b-none border-b-0 shadow-2xl flex flex-col" style={{ height: '360px' }}>
      <div className="flex items-center justify-between px-4 py-2 border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <h3 className="text-sm font-semibold">{title || 'Pipeline Logs'}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScrollLock(!scrollLock)}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            title={scrollLock ? 'Unlock scroll' : 'Lock scroll'}
          >
            {scrollLock ? <Lock size={14} /> : <Unlock size={14} />}
          </button>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"><X size={14} /></button>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 overflow-auto p-3 bg-gray-950 text-gray-300 log-panel">
        {messages.length === 0 && (
          <p className="text-gray-600 text-center py-4">Waiting for log entries...</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className="flex gap-2 leading-5">
            <span className="text-gray-600 shrink-0">{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : '--:--:--'}</span>
            <span className={`shrink-0 font-medium ${levelColors[msg.level] || 'text-gray-400'}`}>[{msg.level || 'INFO'}]</span>
            <span>{msg.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
