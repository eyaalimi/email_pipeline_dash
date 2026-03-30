import { useState } from 'react'
import ExecutionHistory from '../components/ExecutionHistory'
import JsonViewer from '../components/JsonViewer'
import PipelineLogPanel from '../components/PipelineLogPanel'

export default function History() {
  const [jsonEmailId, setJsonEmailId] = useState(null)
  const [logRun, setLogRun] = useState(null)

  const logMessages = logRun?.logs
    ? logRun.logs.split('\n').filter(Boolean).map(line => {
        const match = line.match(/\[(.+?)\] \[(.+?)\] (.+)/)
        return match ? { timestamp: match[1], level: match[2], message: match[3] } : { message: line, level: 'INFO' }
      })
    : []

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Execution History</h1>
      <ExecutionHistory
        onViewJson={id => setJsonEmailId(id)}
        onViewLogs={run => setLogRun(run)}
      />
      <JsonViewer emailId={jsonEmailId} open={!!jsonEmailId} onClose={() => setJsonEmailId(null)} />
      <PipelineLogPanel messages={logMessages} open={!!logRun} onClose={() => setLogRun(null)} title={logRun ? `Run #${logRun.id} Logs` : 'Logs'} />
    </div>
  )
}
