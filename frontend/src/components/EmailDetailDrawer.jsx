import { useState, useEffect } from 'react'
import { X, Play, RefreshCw } from 'lucide-react'
import StatusBadge from './StatusBadge'
import ExportButtons from './ExportButtons'
import { getPipelineRuns, runPipeline } from '../services/api'
import toast from 'react-hot-toast'
import { useRole } from '../contexts/RoleContext'

export default function EmailDetailDrawer({ email, open, onClose, onRunPipeline, onViewJson }) {
  const [runs, setRuns] = useState([])
  const [runLoading, setRunLoading] = useState(false)
  const { isAdmin } = useRole()

  useEffect(() => {
    if (open && email) {
      getPipelineRuns({ email_id: email.id }).then(setRuns).catch(() => {})
    }
  }, [open, email])

  if (!open || !email) return null

  const handleRun = async () => {
    setRunLoading(true)
    try {
      const run = await runPipeline(email.id)
      toast.success('Pipeline started')
      onRunPipeline?.(email.id, run)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed')
    } finally {
      setRunLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b dark:border-gray-800 px-6 py-4 flex items-center justify-between">
          <h2 className="font-semibold text-lg truncate pr-4">Email Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase mb-1">Subject</h3>
            <p className="font-medium">{email.subject}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase mb-1">From</h3>
              <p className="text-sm">{email.sender}</p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase mb-1">To</h3>
              <p className="text-sm">{email.recipient}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase mb-1">Received</h3>
              <p className="text-sm">{new Date(email.received_date).toLocaleString()}</p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase mb-1">Status</h3>
              <StatusBadge status={email.status} />
            </div>
          </div>

          {email.body_preview && (
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase mb-1">Body Preview</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{email.body_preview}</p>
            </div>
          )}

          {email.pdf_filename && (
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase mb-1">Attachment</h3>
              <p className="text-sm">{email.pdf_filename}</p>
            </div>
          )}

          <div className="flex gap-2">
            {isAdmin && (
              <button onClick={handleRun} disabled={runLoading || email.status === 'processing'} className="btn-primary btn-sm flex items-center gap-1.5">
                {runLoading ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                {email.status === 'error' ? 'Retry Pipeline' : 'Run Pipeline'}
              </button>
            )}
            {email.status === 'completed' && (
              <button onClick={() => onViewJson?.(email.id)} className="btn-secondary btn-sm">View JSON</button>
            )}
            <ExportButtons emailId={email.id} disabled={email.status !== 'completed'} />
          </div>

          {runs.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Pipeline History</h3>
              <div className="space-y-2">
                {runs.map(run => (
                  <div key={run.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                    <div>
                      <span className="text-gray-500 mr-2">#{run.id}</span>
                      <StatusBadge status={run.status} />
                    </div>
                    <span className="text-gray-500 text-xs">{new Date(run.started_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
