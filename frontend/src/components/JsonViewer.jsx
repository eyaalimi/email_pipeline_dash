import { useState, useEffect } from 'react'
import { X, Copy, Check, Code, AlignLeft } from 'lucide-react'
import { getJsonOutput } from '../services/api'
import toast from 'react-hot-toast'

function JsonTree({ data, depth = 0 }) {
  const [collapsed, setCollapsed] = useState(depth > 2)

  if (data === null) return <span className="text-gray-500">null</span>
  if (typeof data === 'boolean') return <span className="text-purple-600 dark:text-purple-400">{String(data)}</span>
  if (typeof data === 'number') return <span className="text-blue-600 dark:text-blue-400">{data}</span>
  if (typeof data === 'string') return <span className="text-green-700 dark:text-green-400">"{data}"</span>

  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="text-gray-500">[]</span>
    return (
      <span>
        <button onClick={() => setCollapsed(!collapsed)} className="text-gray-400 hover:text-gray-600 mr-1">{collapsed ? '▸' : '▾'}</button>
        <span className="text-gray-500">[{data.length}]</span>
        {!collapsed && (
          <div className="ml-4 border-l border-gray-200 dark:border-gray-700 pl-3">
            {data.map((item, i) => (
              <div key={i}><JsonTree data={item} depth={depth + 1} />{i < data.length - 1 && ','}</div>
            ))}
          </div>
        )}
      </span>
    )
  }

  if (typeof data === 'object') {
    const entries = Object.entries(data)
    if (entries.length === 0) return <span className="text-gray-500">{'{}'}</span>
    return (
      <span>
        <button onClick={() => setCollapsed(!collapsed)} className="text-gray-400 hover:text-gray-600 mr-1">{collapsed ? '▸' : '▾'}</button>
        <span className="text-gray-500">{`{${entries.length}}`}</span>
        {!collapsed && (
          <div className="ml-4 border-l border-gray-200 dark:border-gray-700 pl-3">
            {entries.map(([key, val], i) => (
              <div key={key}>
                <span className="text-red-700 dark:text-red-400">"{key}"</span>: <JsonTree data={val} depth={depth + 1} />{i < entries.length - 1 && ','}
              </div>
            ))}
          </div>
        )}
      </span>
    )
  }

  return <span>{String(data)}</span>
}

export default function JsonViewer({ emailId, open, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [raw, setRaw] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (open && emailId) {
      setLoading(true)
      getJsonOutput(emailId).then(setData).catch(() => toast.error('Failed to load JSON')).finally(() => setLoading(false))
    }
  }, [open, emailId])

  if (!open) return null

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="card w-full max-w-3xl mx-4 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
          <h2 className="text-lg font-semibold">Agent 1 — Parsed JSON Output</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setRaw(!raw)} className="btn-secondary btn-sm flex items-center gap-1.5">
              {raw ? <><AlignLeft size={14} /> Tree</> : <><Code size={14} /> Raw</>}
            </button>
            <button onClick={copyJson} disabled={!data} className="btn-secondary btn-sm flex items-center gap-1.5">
              {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
            </button>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><X size={20} /></button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 json-viewer-container">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-draxel-600" />
            </div>
          ) : data ? (
            raw ? (
              <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
            ) : (
              <JsonTree data={data} />
            )
          ) : (
            <p className="text-gray-500 text-center py-10">No JSON output available</p>
          )}
        </div>
      </div>
    </div>
  )
}
