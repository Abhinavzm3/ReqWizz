import { useEffect, useState } from 'react'
import RequestComposer from './RequestComposer'
import HistoryPanel from './HistoryPanel'
import Collections from './Collections'
import { FiClock, FiCode, FiFolder, FiLogOut, FiSend, FiUser } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { clearAuthUser } from '../redux/authSlice'
import { toast } from 'react-toastify'

function Home() {
  const [activeTab, setActiveTab] = useState('composer')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)

  const tabs = [
    { id: 'composer', label: 'Composer', icon: <FiSend size={16} /> },
    { id: 'history', label: 'History', icon: <FiClock size={16} /> },
    { id: 'collections', label: 'Collections', icon: <FiFolder size={16} /> },
  ]

  const activeTitle = tabs.find((tab) => tab.id === activeTab)?.label

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab)
    }
  }, [location.state])

  const handleLogout = async () => {
    try {
      dispatch(clearAuthUser())
      localStorage.removeItem('authUser')
      sessionStorage.removeItem('authUser')
      toast.success('Logout successful')
      navigate('/login')
    } catch (error) {
      toast.error('Logout failed')
      console.error('Logout failed:', error)
    }
  }

  return (
    
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link to="/main" className="flex items-center gap-3">
              <img src="/logo.png" alt="ReqWiz" className="h-10 w-10 rounded-md object-cover" />
              <div>
                <h1 className="text-base font-semibold leading-5 text-slate-950">ReqWiz</h1>
                <p className="text-xs text-slate-500">API workspace</p>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 rounded-md border border-slate-200 bg-slate-50 p-1 md:flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex h-9 items-center gap-2 rounded px-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-600 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/doct"
              className="hidden h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950 sm:inline-flex"
            >
              <FiCode size={16} />
              Docs
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 sm:flex">
                  {user.picture ? (
                    <img src={user.picture} alt={user.name || 'User'} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                      <FiUser size={16} />
                    </div>
                  )}
                  <span className="max-w-40 truncate text-sm font-medium text-slate-700">
                    {user.name || user.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  <FiLogOut size={16} />
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex h-9 items-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white hover:bg-slate-800"
              >
                <FcGoogle size={18} />
                Sign in
              </Link>
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 bg-white px-4 py-2 md:hidden">
          <div className="mx-auto grid max-w-7xl grid-cols-3 gap-1 rounded-md border border-slate-200 bg-slate-50 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex h-9 items-center justify-center gap-2 rounded text-sm font-medium ${
                  activeTab === tab.id ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Workspace</p>
            <h2 className="text-2xl font-semibold text-slate-950">{activeTitle}</h2>
          </div>
        </div>

        {activeTab === 'composer' && <RequestComposer />}
        {activeTab === 'history' && <HistoryPanel />}
        {activeTab === 'collections' && <Collections />}
      </main>
    </div>
  )
}

export default Home