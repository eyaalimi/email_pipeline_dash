import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { LayoutDashboard, Mail, History as HistoryIcon, Sun, Moon } from 'lucide-react'
import { RoleProvider } from './contexts/RoleContext'
import RoleToggle from './components/RoleToggle'
import Dashboard from './pages/Dashboard'
import Emails from './pages/Emails'
import History from './pages/History'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/emails', icon: Mail, label: 'Emails' },
  { to: '/history', icon: HistoryIcon, label: 'History' },
]

export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <RoleProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-draxel-700 flex items-center justify-center text-white font-bold text-sm">D</div>
                  <span className="font-semibold text-lg hidden sm:inline">Dräxlmaier</span>
                  <span className="text-xs text-gray-500 hidden md:inline ml-1">AI Email Pipeline</span>
                </div>
                <nav className="flex items-center gap-1">
                  {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={to === '/'}
                      className={({ isActive }) =>
                        `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          isActive ? 'bg-draxel-50 dark:bg-draxel-900/20 text-draxel-700 dark:text-draxel-400' : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400'
                        }`
                      }
                    >
                      <Icon size={16} /> <span className="hidden sm:inline">{label}</span>
                    </NavLink>
                  ))}
                </nav>
              </div>
              <div className="flex items-center gap-3">
                <RoleToggle />
                <button onClick={() => setDark(!dark)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  {dark ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>
            </div>
          </header>

          {/* Main */}
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/emails" element={<Emails />} />
              <Route path="/history" element={<History />} />
            </Routes>
          </main>
        </div>

        <Toaster position="bottom-right" toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
          duration: 3000,
        }} />
      </BrowserRouter>
    </RoleProvider>
  )
}
