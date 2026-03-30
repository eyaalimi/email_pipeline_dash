import { useState, useEffect } from 'react'
import { getStats } from '../services/api'
import { Mail, CheckCircle, Clock, AlertTriangle, Percent, Timer } from 'lucide-react'

export default function StatsCards() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    getStats().then(setStats).catch(() => {})
  }, [])

  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card p-4 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          </div>
        ))}
      </div>
    )
  }

  const cards = [
    { label: 'Total Emails', value: stats.total_emails, icon: Mail, color: 'text-blue-600' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-600' },
    { label: 'Errors', value: stats.error, icon: AlertTriangle, color: 'text-red-600' },
    { label: 'Success Rate', value: `${stats.success_rate}%`, icon: Percent, color: 'text-emerald-600' },
    { label: 'Avg Time', value: `${stats.avg_processing_seconds}s`, icon: Timer, color: 'text-purple-600' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Icon size={16} className={color} />
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</span>
          </div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
      ))}
    </div>
  )
}
