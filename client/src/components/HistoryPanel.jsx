import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { FiClock, FiSearch, FiTrash2 } from 'react-icons/fi'
import { deleteHistoryEntry, getHistory } from '../services/Api'

export default function HistoryPanel() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { user } = useSelector((state) => state.auth)
  const userId = user?._id

  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        const { data } = await getHistory(userId)
        setHistory(data)
      } catch (error) {
        toast.error('Failed to fetch history')
        console.error('Failed to fetch history', error)
      }
      setLoading(false)
    }
    fetchHistory()
  }, [userId])

  const handleDelete = async (id) => {
    try {
      await deleteHistoryEntry(id)
      setHistory(history.filter((item) => item._id !== id))
      toast.success('History entry deleted')
    } catch (error) {
      console.error('Failed to delete history entry', error)
      toast.error('Failed to delete history entry')
    }
  }

  const filteredHistory = history.filter((item) =>
    item.url.toLowerCase().includes(search.toLowerCase()) || item.method.toLowerCase().includes(search.toLowerCase())
  )

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Request history</h2>
          <p className="text-sm text-slate-500">{filteredHistory.length} saved requests</p>
        </div>

        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="h-10 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <FiClock size={22} />
          </div>
          <p className="font-medium text-slate-700">No history records found</p>
          <p className="mt-1 text-sm text-slate-500">Requests you send will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">Method</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">URL</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">Time</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredHistory.map((entry) => (
                <tr key={entry._id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-5 py-4">
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${
                        entry.method === 'GET'
                          ? 'bg-emerald-100 text-emerald-700'
                          : entry.method === 'POST'
                            ? 'bg-sky-100 text-sky-700'
                            : entry.method === 'PUT'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {entry.method}
                    </span>
                  </td>
                  <td className="max-w-xl px-5 py-4">
                    <div className="truncate text-sm font-medium text-slate-800" title={entry.url}>
                      {entry.url}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${
                        entry.status >= 200 && entry.status < 300
                          ? 'bg-emerald-100 text-emerald-700'
                          : entry.status >= 400
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {entry.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">{formatTime(entry.timestamp)}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    <button
                      onClick={() => handleDelete(entry._id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Delete history entry"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}