import { useState, useEffect } from 'react'
import { getPipelineRuns } from '../services/api'
import StatusBadge from './StatusBadge'
import { Eye, FileSpreadsheet, RefreshCw } from 'lucide-react'

export default function ExecutionHistory({ onViewJson, onViewLogs }) {
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ status: '', page: 1 })

  const fetch = () => {
    setLoading(true)
    const params = { page: filter.page, per_page: 20 }
    if (filter.status) params.status = filter.status
    getPipelineRuns(params).then(setRuns).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(fetch, [filter.status, filter.page])

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <select className="input w-40" value={filter.status} onChange={e => setFilter(p => ({ ...p, status: e.target.value, page: 1 }))}>
          <option value="">All statuses</option>
          <option value="running">Running</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>
        <button onClick={fetch} className="btn-secondary btn-sm flex items-center gap-1.5"><RefreshCw size={14} /> Refresh</button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Started</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Duration</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b dark:border-gray-800">
                  <td className="px-4 py-3" colSpan={5}><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" /></td>
                </tr>
              ))
            ) : runs.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-500">No pipeline runs found</td></tr>
            ) : (
              runs.map(run => {
                const duration = run.completed_at && run.started_at
                  ? ((new Date(run.completed_at) - new Date(run.started_at)) / 1000).toFixed(1) + 's'
                  : run.status === 'running' ? 'Running...' : '-'
                return (
                  <tr key={run.id} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30">
                    <td className="px-4 py-3 font-medium max-w-xs truncate">{run.email_subject || `Email #${run.email_id}`}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{new Date(run.started_at).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{duration}</td>
                    <td className="px-4 py-3"><StatusBadge status={run.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {run.status === 'success' && (
                          <>
                            <button onClick={() => onViewJson?.(run.email_id)} className="p-1.5 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600" title="View JSON">
                              <Eye size={15} />
                            </button>
                            <a href={`/api/exports/excel/${run.email_id}`} className="p-1.5 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600" title="Download Excel">
                              <FileSpreadsheet size={15} />
                            </a>
                          </>
                        )}
                        <button onClick={() => onViewLogs?.(run)} className="p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600" title="View Logs">
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
