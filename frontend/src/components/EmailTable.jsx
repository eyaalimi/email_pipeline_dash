import { useState } from 'react'
import { Play, Eye, RefreshCw, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import StatusBadge from './StatusBadge'
import ExportButtons from './ExportButtons'
import { useRole } from '../contexts/RoleContext'
import { runPipeline, deleteEmail } from '../services/api'
import toast from 'react-hot-toast'

export default function EmailTable({ items, total, page, per_page, loading, onPageChange, onRefresh, onViewJson, onViewDetail, onRunPipeline }) {
  const { isAdmin } = useRole()
  const [selected, setSelected] = useState(new Set())
  const [actionLoading, setActionLoading] = useState({})
  const totalPages = Math.ceil(total / per_page)

  const toggleSelect = (id) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  const toggleAll = () => {
    if (selected.size === items.length) setSelected(new Set())
    else setSelected(new Set(items.map(e => e.id)))
  }

  const handleRun = async (id) => {
    setActionLoading(p => ({ ...p, [id]: true }))
    try {
      const run = await runPipeline(id)
      toast.success('Pipeline started')
      onRunPipeline?.(id, run)
      setTimeout(() => onRefresh?.(), 1000)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to start pipeline')
    } finally {
      setActionLoading(p => ({ ...p, [id]: false }))
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this email?')) return
    try {
      await deleteEmail(id)
      toast.success('Email deleted')
      onRefresh?.()
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              {isAdmin && (
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={selected.size === items.length && items.length > 0} onChange={toggleAll} className="rounded" />
                </th>
              )}
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Subject</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Sender</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Date</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b dark:border-gray-800">
                  {isAdmin && <td className="px-4 py-3"><div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></td>}
                  <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-36 animate-pulse" /></td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr><td colSpan={isAdmin ? 6 : 5} className="px-4 py-12 text-center text-gray-500">No emails found</td></tr>
            ) : (
              items.map(email => (
                <tr
                  key={email.id}
                  className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30 cursor-pointer transition-colors"
                  onClick={() => onViewDetail?.(email)}
                >
                  {isAdmin && (
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.has(email.id)} onChange={() => toggleSelect(email.id)} className="rounded" />
                    </td>
                  )}
                  <td className="px-4 py-3 font-medium max-w-xs truncate">{email.subject}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-[200px] truncate">{email.sender}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{new Date(email.received_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={email.status} /></td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      {isAdmin && (
                        <button
                          onClick={() => handleRun(email.id)}
                          disabled={actionLoading[email.id] || email.status === 'processing'}
                          className="p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 disabled:opacity-40"
                          title={email.status === 'error' ? 'Retry Pipeline' : 'Run Pipeline'}
                        >
                          {actionLoading[email.id] ? <RefreshCw size={15} className="animate-spin" /> : <Play size={15} />}
                        </button>
                      )}
                      <button
                        onClick={() => onViewJson?.(email.id)}
                        disabled={email.status !== 'completed'}
                        className="p-1.5 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 disabled:opacity-40"
                        title="View JSON"
                      >
                        <Eye size={15} />
                      </button>
                      <ExportButtons emailId={email.id} disabled={email.status !== 'completed'} />
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(email.id)}
                          className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t dark:border-gray-800">
          <span className="text-sm text-gray-500">{total} total emails</span>
          <div className="flex items-center gap-2">
            <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="p-1 rounded disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800">
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm">Page {page} of {totalPages}</span>
            <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="p-1 rounded disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function useSelectedEmails() {
  const [selected, setSelected] = useState(new Set())
  return { selected, setSelected }
}
