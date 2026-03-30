import { useRole } from '../contexts/RoleContext'
import { Shield, Eye } from 'lucide-react'

export default function RoleToggle() {
  const { role, setRole } = useRole()
  return (
    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      <button
        onClick={() => setRole('admin')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          role === 'admin' ? 'bg-white dark:bg-gray-700 shadow-sm text-draxel-700 dark:text-draxel-400' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Shield size={14} /> IT Admin
      </button>
      <button
        onClick={() => setRole('client')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          role === 'client' ? 'bg-white dark:bg-gray-700 shadow-sm text-draxel-700 dark:text-draxel-400' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Eye size={14} /> Client
      </button>
    </div>
  )
}
