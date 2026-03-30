import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { getStats, getVolume } from '../services/api'

const STATUS_COLORS = { completed: '#22c55e', pending: '#eab308', processing: '#3b82f6', error: '#ef4444' }

export default function Charts() {
  const [stats, setStats] = useState(null)
  const [volume, setVolume] = useState([])

  useEffect(() => {
    getStats().then(setStats)
    getVolume().then(setVolume)
  }, [])

  const pieData = stats ? [
    { name: 'Completed', value: stats.completed },
    { name: 'Pending', value: stats.pending },
    { name: 'Processing', value: stats.processing },
    { name: 'Error', value: stats.error },
  ].filter(d => d.value > 0) : []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Emails by Status</h3>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name.toLowerCase()]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-gray-400">No data</div>
        )}
      </div>

      <div className="card p-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Processing Volume</h3>
        {volume.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={volume}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="success" fill="#22c55e" name="Success" radius={[4, 4, 0, 0]} />
              <Bar dataKey="failed" fill="#ef4444" name="Failed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-gray-400">No data yet</div>
        )}
      </div>
    </div>
  )
}
