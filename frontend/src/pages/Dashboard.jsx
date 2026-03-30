import StatsCards from '../components/StatsCards'
import Charts from '../components/Charts'
import ActivityFeed from '../components/ActivityFeed'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <StatsCards />
      <Charts />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2" />
        <ActivityFeed />
      </div>
    </div>
  )
}
