import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { FiCheck, FiPlus, FiSave, FiSend, FiTrash2 } from 'react-icons/fi'
import { addRequestToCollection, createCollection, getCollections, sendRequest, generateAiRequest } from '../services/Api'
import CollectionSelector from './CollectionSelector'
import ParamsSection from './ParamsSection'
import ResponseViewer from './ResponseViewer'

export default function RequestComposer() {
  const [method, setMethod] = useState('GET')
  const [baseUrl, setBaseUrl] = useState('')
  const [params, setParams] = useState([{ key: '', value: '', enabled: true }])
  const [queryString, setQueryString] = useState('')
  const [headers, setHeaders] = useState([{ key: '', value: '' }])
  const [body, setBody] = useState('')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [collections, setCollections] = useState([])
  const [selectedCollection, setSelectedCollection] = useState(null)
  const [saveLoading, setSaveLoading] = useState(false)
  const [requestName, setRequestName] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const { user } = useSelector((state) => state.auth)
  const location = useLocation()
  const userId = user?._id

  useEffect(() => {
    const fetchCollections = async () => {
      if (!userId) return

      try {
        const { data } = await getCollections(userId)
        setCollections(data)
      } catch (error) {
        console.error('Failed to fetch collections', error)
      }
    }

    fetchCollections()
  }, [userId])

  useEffect(() => {
    const requestData = location.state?.requestData
    if (!requestData) return

    const [urlWithoutQuery, query = ''] = (requestData.url || '').split('?')
    const queryParams = Array.from(new URLSearchParams(query).entries()).map(([key, value]) => ({
      key,
      value,
      enabled: true,
    }))
    const savedHeaders = Array.isArray(requestData.headers)
      ? requestData.headers
      : Object.entries(requestData.headers || {}).map(([key, value]) => ({ key, value: String(value) }))
    const savedBody = typeof requestData.body === 'string' ? requestData.body : JSON.stringify(requestData.body ?? '', null, 2)

    setMethod(requestData.method || 'GET')
    setBaseUrl(urlWithoutQuery)
    setQueryString(query)
    setParams(queryParams.length > 0 ? queryParams : [{ key: '', value: '', enabled: true }])
    setHeaders(savedHeaders.length > 0 ? savedHeaders : [{ key: '', value: '' }])
    setBody(savedBody === '""' ? '' : savedBody)
    setRequestName(requestData.name || '')
  }, [location.state])

  useEffect(() => {
    const collectionId = location.state?.collectionId
    if (!collectionId || collections.length === 0) return

    const collection = collections.find((item) => item._id === collectionId)
    if (collection) {
      setSelectedCollection(collection)
    }
  }, [collections, location.state])

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return
    setAiLoading(true)
    try {
      const { data } = await generateAiRequest(aiPrompt)
      if (data.method) setMethod(data.method.toUpperCase())
      if (data.url) {
        const [urlWithoutQuery, query = ''] = data.url.split('?')
        setBaseUrl(urlWithoutQuery)
        setQueryString(query)
        const queryParams = Array.from(new URLSearchParams(query).entries()).map(([key, value]) => ({
          key, value, enabled: true
        }))
        if (queryParams.length > 0) setParams(queryParams)
      }
      if (data.body) setBody(typeof data.body === 'string' ? data.body : JSON.stringify(data.body, null, 2))
      if (data.headers && Array.isArray(data.headers)) {
        setHeaders(data.headers.length > 0 ? data.headers : [{ key: '', value: '' }])
      }
    } catch (error) {
      alert('Failed to generate request from prompt')
    }
    setAiLoading(false)
  }

  const handleSend = async () => {
    setLoading(true)
    try {
      const url = baseUrl + (queryString ? `?${queryString}` : '')
      const headersObj = headers.reduce((acc, { key, value }) => {
        if (key) acc[key] = value
        return acc
      }, {})

      const { data } = await sendRequest({ method, url, headers: headersObj, body, _id: userId })
      setResponse(data)
    } catch {
      setResponse({
        status: 500,
        body: { error: 'Request failed' },
      })
    }
    setLoading(false)
  }

  const handleSaveRequest = async () => {
    if (!selectedCollection) return
    if (!requestName.trim()) {
      alert('Please enter a name for your request')
      return
    }

    setSaveLoading(true)
    try {
      const requestData = {
        name: requestName,
        url: baseUrl + (queryString ? `?${queryString}` : ''),
        method,
        headers: headers.filter((h) => h.key && h.value),
        body,
      }

      await addRequestToCollection(selectedCollection._id, requestData, userId)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to save request', error)
      alert('Failed to save request to collection')
    }
    setSaveLoading(false)
  }

  const handleCreateCollection = async (name) => {
    try {
      const { data } = await createCollection({
        name,
        requests: [],
        user_id: userId,
      })
      setCollections([...collections, data])
      setSelectedCollection(data)
      setRequestName(`Request to ${baseUrl.split('/').pop() || 'endpoint'}`)
    } catch (error) {
      console.error('Failed to create collection', error)
      alert('Failed to create collection')
    }
  }

  const addHeader = () => setHeaders([...headers, { key: '', value: '' }])

  const updateHeader = (index, field, value) => {
    const updated = [...headers]
    updated[index][field] = value
    setHeaders(updated)
  }

  const removeHeader = (index) => {
    const filtered = headers.filter((_, i) => i !== index)
    setHeaders(filtered)
  }

  const getMethodColor = (m) => {
    switch (m) {
      case 'GET':
        return 'bg-emerald-600'
      case 'POST':
        return 'bg-sky-600'
      case 'PUT':
        return 'bg-amber-600'
      case 'DELETE':
        return 'bg-rose-600'
      default:
        return 'bg-slate-700'
    }
  }

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-indigo-50 px-5 py-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="text-indigo-600 font-bold whitespace-nowrap">✨ AI Prompt:</span>
            <input
              type="text"
              value={aiPrompt}
              maxLength={500}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Send a POST to /api/users with name John"
              className={`h-9 flex-1 rounded-md border px-3 text-sm outline-none transition ${
                aiPrompt.length > 450
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-300'
                  : 'border-indigo-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400'
              }`}
            />
            <button
              onClick={handleAiGenerate}
              disabled={aiLoading || !aiPrompt.trim() || aiPrompt.length > 500}
              className="h-9 rounded-md bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              {aiLoading
                ? <span className="flex items-center gap-2"><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />Thinking…</span>
                : 'Generate'
              }
            </button>
          </div>
          <div className="flex items-center justify-between px-1">
            {aiPrompt.length > 450
              ? <span className="text-xs font-medium text-rose-500">⚠ Prompt too long — keep it under 500 characters for best results.</span>
              : <span className="text-xs text-indigo-400 opacity-60">Describe the request you want to build in plain English</span>
            }
            <span className={`text-xs tabular-nums ${aiPrompt.length > 450 ? 'font-semibold text-rose-500' : 'text-indigo-400 opacity-60'}`}>
              {aiPrompt.length} / 500
            </span>
          </div>
        </div>
      </div>
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-shrink-0">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className={`${getMethodColor(method)} h-11 rounded-md border-0 py-2 pl-4 pr-10 text-sm font-semibold text-white shadow-sm outline-none`}
            >
              {['GET', 'POST', 'PUT', 'DELETE'].map((m) => (
                <option key={m} value={m} className="bg-white text-slate-800">
                  {m}
                </option>
              ))}
            </select>
          </div>

          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.example.com/endpoint"
            className="h-11 min-w-0 flex-1 rounded-md border border-slate-300 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />

          <button
            onClick={handleSend}
            disabled={loading || !baseUrl}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold text-white transition-colors ${
              loading || !baseUrl ? 'bg-slate-300' : 'bg-slate-950 hover:bg-slate-800'
            }`}
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <FiSend size={16} />
            )}
            Send
          </button>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5 p-5">
          <ParamsSection params={params} setParams={setParams} base_url={baseUrl} onParamsChange={setQueryString} />

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Headers</h3>
              <button onClick={addHeader} className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-950">
                <FiPlus size={15} />
                Add header
              </button>
            </div>

            <div className="space-y-2">
              {headers.map((header, i) => (
                <div key={i} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_36px] gap-2">
                  <input
                    placeholder="Key"
                    value={header.key}
                    onChange={(e) => updateHeader(i, 'key', e.target.value)}
                    className="h-10 min-w-0 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                  <input
                    placeholder="Value"
                    value={header.value}
                    onChange={(e) => updateHeader(i, 'value', e.target.value)}
                    className="h-10 min-w-0 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                  <button
                    onClick={() => removeHeader(i)}
                    className="inline-flex h-10 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    aria-label="Remove header"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-slate-800">Body</h3>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="w-full rounded-md border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-900 outline-none focus:border-slate-500 focus:bg-white focus:ring-2 focus:ring-slate-200"
              placeholder='{ "key": "value" }'
            />
          </section>
        </div>

        <aside className="border-t border-slate-200 bg-slate-50 p-5 lg:border-l lg:border-t-0">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Save request</h3>
          <CollectionSelector
            collections={collections}
            selectedCollection={selectedCollection}
            onSelectCollection={setSelectedCollection}
            onCreateCollection={handleCreateCollection}
          />

          {selectedCollection && (
            <div className="mt-4">
              <div className="flex overflow-hidden rounded-md border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-slate-200">
                <input
                  type="text"
                  value={requestName}
                  onChange={(e) => setRequestName(e.target.value)}
                  placeholder="Request name"
                  className="min-w-0 flex-1 border-0 px-3 py-2 text-sm outline-none"
                />
                <button
                  onClick={handleSaveRequest}
                  disabled={saveLoading || !requestName.trim()}
                  className={`inline-flex items-center gap-2 px-3 text-sm font-semibold text-white ${
                    saveLoading || !requestName.trim() ? 'bg-slate-300' : 'bg-slate-950 hover:bg-slate-800'
                  }`}
                >
                  {saveLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <FiSave size={15} />}
                  Save
                </button>
              </div>
              {saveSuccess && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                  <FiCheck size={15} />
                  Request saved
                </div>
              )}
            </div>
          )}
        </aside>
      </div>

      {/* Response Viewer — full width below the composer */}
      {response && (
        <div className="border-t border-slate-200 p-5">
          <ResponseViewer
            response={response}
            requestDetails={{ method, url: baseUrl + (queryString ? `?${queryString}` : ''), headers, body }}
          />
        </div>
      )}
    </div>
  )
}