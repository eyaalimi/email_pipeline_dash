import { FileSpreadsheet, FileText } from 'lucide-react'
import { downloadExcel, downloadCsv } from '../services/api'

export default function ExportButtons({ emailId, disabled }) {
  const handleClick = (e) => {
    if (disabled) {
      e.preventDefault()
      return
    }
    // Let the browser handle the download via the anchor
  }

  return (
    <div className="flex gap-1">
      <a
        href={disabled ? '#' : downloadExcel(emailId)}
        download
        onClick={(e) => handleClick(e)}
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md font-medium transition-colors ${
          disabled ? 'text-gray-400 cursor-not-allowed pointer-events-none' : 'text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
        }`}
        title="Export Excel"
      >
        <FileSpreadsheet size={14} /> XLSX
      </a>
      <a
        href={disabled ? '#' : downloadCsv(emailId)}
        download
        onClick={(e) => handleClick(e)}
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md font-medium transition-colors ${
          disabled ? 'text-gray-400 cursor-not-allowed pointer-events-none' : 'text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
        }`}
        title="Export CSV"
      >
        <FileText size={14} /> CSV
      </a>
    </div>
  )
}
