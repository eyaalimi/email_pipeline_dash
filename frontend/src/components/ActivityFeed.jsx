import { useState, useEffect } from 'react'
import { getActivity } from '../services/api'
import StatusBadge from './StatusBadge'
import { Activity } from 'lucide-react'

export default function ActivityFeed() {
  const [events, setEvents] = useState([])

  useEffect(() => {
    getActivity().then(setEvents).catch(() => {})
    const interval = setInterval(() => getActivity().then(setEvents).catch(() => {}), 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
        <Activity size={16} /> Recent Activity
      </h3>
      {events.length === 0 ? (
        <p className="text-sm text-gray-500 py-2">No recent activity</p>
      ) : (
        <div className="space-y-2">
          {events.slice(0, 5).map(ev => {
            const ago = ev.completed_at || ev.started_at
            const timeStr = ago ? timeAgo(new Date(ago)) : ''
            return (
              <div key={ev.run_id} className="flex items-start gap-2 text-sm">
                <StatusBadge status={ev.status} />
                <div className="flex-1 min-w-0">
                  <p className="truncate">{ev.email_subject}</p>
                  <p className="text-xs text-gray-500">{timeStr}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function timeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
