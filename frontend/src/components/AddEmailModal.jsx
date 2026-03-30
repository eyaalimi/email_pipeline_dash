import { useState, useRef } from 'react'
import { X, Upload } from 'lucide-react'
import { createEmail } from '../services/api'
import toast from 'react-hot-toast'

export default function AddEmailModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ subject: '', sender: '', recipient: '', received_date: '', body_preview: '' })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()

  if (!open) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (file) fd.append('pdf', file)
      await createEmail(fd)
      toast.success('Email added successfully')
      onCreated?.()
      onClose()
      setForm({ subject: '', sender: '', recipient: '', received_date: '', body_preview: '' })
      setFile(null)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add email')
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type === 'application/pdf') setFile(f)
    else toast.error('Only PDF files are accepted')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="card w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Add Email</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Subject *</label>
            <input className="input" required value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Sender *</label>
              <input className="input" type="email" required value={form.sender} onChange={e => setForm(p => ({ ...p, sender: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Recipient *</label>
              <input className="input" type="email" required value={form.recipient} onChange={e => setForm(p => ({ ...p, recipient: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Received Date *</label>
            <input className="input" type="datetime-local" required value={form.received_date} onChange={e => setForm(p => ({ ...p, received_date: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Body Preview</label>
            <textarea className="input" rows={3} value={form.body_preview} onChange={e => setForm(p => ({ ...p, body_preview: e.target.value }))} />
          </div>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-draxel-500 bg-draxel-50 dark:bg-draxel-900/10' : 'border-gray-300 dark:border-gray-600 hover:border-draxel-400'
            }`}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={24} className="mx-auto mb-2 text-gray-400" />
            {file ? (
              <p className="text-sm font-medium">{file.name}</p>
            ) : (
              <p className="text-sm text-gray-500">Drag & drop PDF or click to browse</p>
            )}
            <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={e => setFile(e.target.files[0])} />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary btn-sm">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary btn-sm">
              {loading ? 'Adding...' : 'Add Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
