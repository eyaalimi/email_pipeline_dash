import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Play, Download } from 'lucide-react'
import EmailTable from '../components/EmailTable'
import AddEmailModal from '../components/AddEmailModal'
import JsonViewer from '../components/JsonViewer'
import PipelineLogPanel from '../components/PipelineLogPanel'
import EmailDetailDrawer from '../components/EmailDetailDrawer'
import { useEmails } from '../hooks/useEmails'
import { useWebSocket } from '../hooks/useWebSocket'
import { useRole } from '../contexts/RoleContext'
import { runBatchPipeline, bulkExportExcel } from '../services/api'
import toast from 'react-hot-toast'

export default function Emails() {
  const { isAdmin } = useRole()
  const { items, total, page, per_page, loading, params, setParams, refetch } = useEmails()
  const [showAdd, setShowAdd] = useState(false)
  const [jsonEmailId, setJsonEmailId] = useState(null)
  const [activeRunId, setActiveRunId] = useState(null)
  const [detailEmail, setDetailEmail] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState([])

  const { messages: logMessages } = useWebSocket(activeRunId ? `/ws/logs/${activeRunId}` : '/ws/events')

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'n' && isAdmin) { e.preventDefault(); setShowAdd(true) }
      if (e.key === 'Escape') { setShowAdd(false); setJsonEmailId(null); setDetailEmail(null) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isAdmin])

  const handleSearch = useCallback((e) => {
    e.preventDefault()
    setParams(p => ({ ...p, search, page: 1 }))
  }, [search, setParams])

  const handleBatchRun = async () => {
    if (selectedIds.length === 0) return toast.error('Select emails first')
    try {
      await runBatchPipeline(selectedIds)
      toast.success(`Pipeline triggered for ${selectedIds.length} emails`)
      setTimeout(refetch, 2000)
    } catch {
      toast.error('Batch run failed')
    }
  }

  const handleBatchExport = async () => {
    if (selectedIds.length === 0) return toast.error('Select emails first')
    try {
      await bulkExportExcel(selectedIds)
      toast.success('Export downloaded')
    } catch {
      toast.error('Export failed')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Emails</h1>
        <div className="flex items-center gap-2">
          {isAdmin && selectedIds.length > 0 && (
            <>
              <button onClick={handleBatchRun} className="btn-primary btn-sm flex items-center gap-1.5"><Play size={14} /> Run ({selectedIds.length})</button>
              <button onClick={handleBatchExport} className="btn-secondary btn-sm flex items-center gap-1.5"><Download size={14} /> Export</button>
            </>
          )}
          {isAdmin && (
            <button onClick={() => setShowAdd(true)} className="btn-primary btn-sm flex items-center gap-1.5"><Plus size={14} /> Add Email</button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9 w-64"
              placeholder="Search emails..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-secondary btn-sm">Search</button>
        </form>
        <select
          className="input w-40"
          value={params.status || ''}
          onChange={e => setParams(p => ({ ...p, status: e.target.value || undefined, page: 1 }))}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="error">Error</option>
        </select>
        <input
          type="month"
          className="input w-44"
          value={params.date_from ? params.date_from.slice(0, 7) : ''}
          onChange={e => {
            const v = e.target.value
            setParams(p => ({
              ...p,
              date_from: v ? `${v}-01` : undefined,
              date_to: v ? `${v}-31` : undefined,
              page: 1,
            }))
          }}
        />
      </div>

      <EmailTable
        items={items}
        total={total}
        page={page}
        per_page={per_page}
        loading={loading}
        onPageChange={p => setParams(prev => ({ ...prev, page: p }))}
        onRefresh={refetch}
        onViewJson={id => setJsonEmailId(id)}
        onViewDetail={email => setDetailEmail(email)}
        onRunPipeline={(id, run) => { if (run?.id) setActiveRunId(run.id) }}
      />

      <AddEmailModal open={showAdd} onClose={() => setShowAdd(false)} onCreated={refetch} />
      <JsonViewer emailId={jsonEmailId} open={!!jsonEmailId} onClose={() => setJsonEmailId(null)} />
      <PipelineLogPanel
        messages={logMessages}
        open={!!activeRunId}
        onClose={() => setActiveRunId(null)}
        title={`Pipeline Run #${activeRunId}`}
      />
      <EmailDetailDrawer
        email={detailEmail}
        open={!!detailEmail}
        onClose={() => setDetailEmail(null)}
        onRunPipeline={(id, run) => { if (run?.id) setActiveRunId(run.id) }}
        onViewJson={id => { setDetailEmail(null); setJsonEmailId(id) }}
      />
    </div>
  )
}
