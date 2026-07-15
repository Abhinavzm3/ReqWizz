import { useState, useRef, useEffect } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import {
  FiCopy, FiCode, FiMonitor, FiFileText, FiZap, FiX,
  FiCheckCircle, FiInfo, FiMaximize2, FiMinimize2, FiAlertTriangle
} from 'react-icons/fi'
import { generateAiTypes } from '../services/Api'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

// ── Constants ────────────────────────────────────────────────────────────────
const AI_CHAR_LIMIT = 15_000 // max characters sent to Groq

const analyzeResponseBugs = (requestDetails, responseBody, contentType) =>
  axios.post(`${API_URL}/ai/analyze-response`, { requestDetails, responseBody, contentType })

// ── Helpers ──────────────────────────────────────────────────────────────────
function detectContentType(response) {
  if (!response) return 'unknown'
  const ct = (response.headers?.['content-type'] || '').toLowerCase()
  if (ct.includes('html')) return 'html'
  if (ct.includes('json') || typeof response.body === 'object') return 'json'
  if (ct.includes('xml')) return 'xml'
  return 'text'
}

function getStatusBadge(status) {
  if (status >= 200 && status < 300) return { bg: 'bg-emerald-500', text: `${status} OK`,           dot: 'bg-emerald-300' }
  if (status >= 300 && status < 400) return { bg: 'bg-amber-500',   text: `${status} Redirect`,     dot: 'bg-amber-300'   }
  if (status >= 400 && status < 500) return { bg: 'bg-rose-500',    text: `${status} Client Error`, dot: 'bg-rose-300'    }
  if (status >= 500)                 return { bg: 'bg-red-700',     text: `${status} Server Error`, dot: 'bg-red-400'     }
  return                                    { bg: 'bg-slate-500',   text: `${status}`,              dot: 'bg-slate-400'   }
}

function fmtBytes(n) {
  if (n < 1024) return `${n} chars`
  return `${(n / 1024).toFixed(1)} KB`
}

// ── Sub-components ───────────────────────────────────────────────────────────

function SizeLimitBanner({ bodyLen, limit, onDismiss }) {
  return (
    <div className="mx-4 mb-3 flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3">
      <FiAlertTriangle className="mt-0.5 flex-shrink-0 text-amber-400" size={16} />
      <div className="flex-1 text-xs leading-relaxed text-amber-300">
        <span className="font-bold text-amber-200">Response too large for AI analysis.</span>
        {' '}Your response is <span className="font-semibold">{fmtBytes(bodyLen)}</span>, which exceeds the{' '}
        <span className="font-semibold">{fmtBytes(limit)}</span> limit. Groq may produce incomplete or
        inaccurate results for very large payloads. Consider truncating the response first.
      </div>
      <button onClick={onDismiss} className="flex-shrink-0 rounded p-0.5 text-amber-400 hover:text-amber-200">
        <FiX size={14} />
      </button>
    </div>
  )
}

function AiLoadingOverlay({ action }) {
  const messages = {
    bugs:  { icon: '⚡', label: 'Analyzing bugs & security issues…',   color: 'text-amber-300'  },
    types: { icon: '✨', label: 'Generating TypeScript interfaces…',    color: 'text-indigo-300' },
  }
  const { icon, label, color } = messages[action] || { icon: '🤖', label: 'AI is thinking…', color: 'text-slate-300' }
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="text-3xl animate-bounce">{icon}</div>
        <div className={`text-sm font-semibold ${color}`}>{label}</div>
        {/* Animated progress bar */}
        <div className="h-1 w-48 overflow-hidden rounded-full bg-slate-700">
          <div className="h-full w-1/2 animate-[slide_1.2s_ease-in-out_infinite] rounded-full bg-indigo-500" />
        </div>
        <div className="text-xs text-slate-500">Powered by Groq · llama-3.3-70b-versatile</div>
      </div>
    </div>
  )
}

function BugReport({ bugs, onClose }) {
  if (!bugs) return null
  return (
    <div className="absolute inset-0 z-20 flex items-start justify-center overflow-auto bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-700 px-5 py-4">
          <div className="flex items-center gap-2">
            <FiZap className="text-amber-400" size={18} />
            <span className="font-semibold text-white">AI Bug & Issue Analysis</span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">
            <FiX size={18} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-auto p-5 text-sm text-slate-300">
          <pre className="whitespace-pre-wrap font-sans leading-relaxed">{bugs}</pre>
        </div>
      </div>
    </div>
  )
}

function TypesPanel({ types, onClose }) {
  const [copied, setCopied] = useState(false)
  if (!types) return null
  const handleCopy = () => {
    navigator.clipboard.writeText(types)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="absolute inset-0 z-20 flex items-start justify-center overflow-auto bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-rose-500" />
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
            </div>
            <span className="ml-1 text-xs font-semibold text-slate-300">Generated TypeScript Interfaces</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition ${copied ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'}`}
            >
              {copied ? <FiCheckCircle size={12} /> : <FiCopy size={12} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-700 hover:text-white">
              <FiX size={16} />
            </button>
          </div>
        </div>
        <div className="max-h-[70vh] overflow-auto">
          <SyntaxHighlighter
            language="typescript"
            style={vscDarkPlus}
            customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '13px', lineHeight: '1.6' }}
          >
            {types}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  )
}

// ── ViewerContent (shared between inline + fullscreen) ───────────────────────
function ViewerContent({
  response, requestDetails, contentType, rawBody, isHtml, isJson,
  viewMode, setViewMode, iframeRef, tabs,
  aiAction, handleAnalyzeBugs, handleExportTypes,
  handleCopyRaw, copied, statusBadge,
  bugReport, setBugReport, typesPanel, setTypesPanel,
  sizeLimitWarning, setSizeLimitWarning, bodyLen,
  fullscreen, setFullscreen,
}) {
  const isAiLoading = !!aiAction

  return (
    <div className={`flex flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-xl ${fullscreen ? 'h-full' : ''}`}>

      {/* ── Status / Action Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 bg-slate-800 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold text-white ${statusBadge.bg}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${statusBadge.dot} animate-pulse`} />
            {statusBadge.text}
          </span>
          <span className="text-xs font-medium capitalize text-slate-400">{contentType}</span>
          <span className="text-xs text-slate-600">{fmtBytes(bodyLen)}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* ⚡ Find Bugs */}
          <button
            onClick={handleAnalyzeBugs}
            disabled={isAiLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {aiAction === 'bugs'
              ? <><span className="h-3 w-3 animate-spin rounded-full border-2 border-amber-400/30 border-t-amber-400" /> Analyzing…</>
              : <><FiZap size={12} /> ⚡ Find Bugs</>
            }
          </button>

          {/* ✨ Export Types */}
          {isJson && (
            <button
              onClick={handleExportTypes}
              disabled={isAiLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-400 transition hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {aiAction === 'types'
                ? <><span className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-400/30 border-t-indigo-400" /> Generating…</>
                : <>✨ Export Types</>
              }
            </button>
          )}

          {/* Copy */}
          <button
            onClick={handleCopyRaw}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition ${copied ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            {copied ? <FiCheckCircle size={12} /> : <FiCopy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          {/* Expand / Collapse */}
          <button
            onClick={() => setFullscreen((f) => !f)}
            title={fullscreen ? 'Exit fullscreen' : 'Expand to fullscreen'}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300 transition hover:bg-slate-600 hover:text-white"
          >
            {fullscreen ? <FiMinimize2 size={13} /> : <FiMaximize2 size={13} />}
            {fullscreen ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {/* ── Size limit warning banner (dismissable) ── */}
      {sizeLimitWarning && (
        <div className="pt-3">
          <SizeLimitBanner bodyLen={bodyLen} limit={AI_CHAR_LIMIT} onDismiss={() => setSizeLimitWarning(false)} />
        </div>
      )}

      {/* ── Tab Bar ── */}
      <div className="flex border-b border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setViewMode(tab.id)}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition ${
              viewMode === tab.id
                ? 'border-b-2 border-indigo-500 bg-slate-800 text-indigo-400'
                : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
            }`}
          >
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* ── Content Area ── */}
      <div className={`relative flex-1 ${fullscreen ? 'overflow-auto' : ''}`}>
        {/* AI loading overlay */}
        {aiAction && <AiLoadingOverlay action={aiAction} />}

        {bugReport  && <BugReport bugs={bugReport}   onClose={() => setBugReport(null)}  />}
        {typesPanel && <TypesPanel types={typesPanel} onClose={() => setTypesPanel(null)} />}

        {/* Pretty */}
        {viewMode === 'pretty' && (
          <div className={fullscreen ? 'h-full overflow-auto' : 'max-h-[520px] overflow-auto'}>
            <SyntaxHighlighter
              language={isJson ? 'json' : isHtml ? 'html' : 'text'}
              style={vscDarkPlus}
              customStyle={{ margin: 0, padding: '1.25rem', background: 'transparent', fontSize: '13px', lineHeight: '1.65' }}
              wrapLongLines
            >
              {rawBody}
            </SyntaxHighlighter>
          </div>
        )}

        {/* HTML Preview */}
        {viewMode === 'preview' && isHtml && (
          <div className={`relative flex flex-col ${fullscreen ? 'h-full' : ''}`}>
            <div className="flex items-center gap-2 border-b border-slate-700 bg-slate-800 px-4 py-2">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-rose-500 opacity-70" />
                <div className="h-3 w-3 rounded-full bg-amber-500 opacity-70" />
                <div className="h-3 w-3 rounded-full bg-emerald-500 opacity-70" />
              </div>
              <div className="flex-1 rounded-md bg-slate-700 px-3 py-1 text-center text-xs text-slate-400">
                🔒 sandboxed preview
              </div>
            </div>
            <iframe
              ref={iframeRef}
              title="HTML Preview"
              sandbox="allow-scripts allow-same-origin"
              className="w-full flex-1 bg-white"
              style={{ height: fullscreen ? '100%' : '520px', border: 'none' }}
            />
          </div>
        )}

        {/* Raw */}
        {viewMode === 'raw' && (
          <div className={fullscreen ? 'h-full overflow-auto p-5' : 'max-h-[520px] overflow-auto p-5'}>
            <pre className="whitespace-pre-wrap break-all font-mono text-xs leading-relaxed text-slate-300">{rawBody}</pre>
          </div>
        )}

        {/* Headers */}
        {viewMode === 'headers' && (
          <div className={fullscreen ? 'h-full overflow-auto p-4' : 'max-h-[520px] overflow-auto p-4'}>
            {response.headers && Object.keys(response.headers).length > 0 ? (
              <div className="space-y-1">
                {Object.entries(response.headers).map(([key, val]) => (
                  <div key={key} className="flex gap-3 rounded-md px-3 py-2 text-xs hover:bg-slate-800">
                    <span className="w-52 flex-shrink-0 font-semibold text-indigo-400">{key}</span>
                    <span className="break-all text-slate-300">{String(val)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-slate-500">No headers available</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function ResponseViewer({ response, requestDetails }) {
  const [viewMode, setViewMode] = useState('pretty')
  const [aiAction, setAiAction] = useState(null)   // 'bugs' | 'types' | null
  const [bugReport, setBugReport]   = useState(null)
  const [typesPanel, setTypesPanel] = useState(null)
  const [copied, setCopied]         = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [sizeLimitWarning, setSizeLimitWarning] = useState(false)
  const iframeRef = useRef(null)

  const contentType = detectContentType(response)
  const isHtml = contentType === 'html'
  const isJson = contentType === 'json'
  const rawBody = typeof response?.body === 'string'
    ? response.body
    : JSON.stringify(response?.body, null, 2)
  const bodyLen = rawBody?.length ?? 0
  const isTooBig = bodyLen > AI_CHAR_LIMIT
  const statusBadge = getStatusBadge(response?.status)

  useEffect(() => { setViewMode(isHtml ? 'preview' : 'pretty') }, [isHtml, response])
  useEffect(() => { setSizeLimitWarning(false) }, [response])   // reset on new response

  // ESC closes fullscreen
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && fullscreen) setFullscreen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [fullscreen])

  // Populate iframe
  useEffect(() => {
    if (viewMode === 'preview' && iframeRef.current && isHtml) {
      const doc = iframeRef.current.contentDocument
      if (doc) { doc.open(); doc.write(rawBody); doc.close() }
    }
  }, [viewMode, rawBody, isHtml])

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(rawBody)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAnalyzeBugs = async () => {
    // Show warning but still allow (user can proceed knowingly)
    if (isTooBig) {
      setSizeLimitWarning(true)
    }
    setAiAction('bugs')
    setBugReport(null)
    try {
      const { data } = await analyzeResponseBugs(requestDetails, response?.body, contentType)
      setBugReport(data.analysis)
    } catch {
      setBugReport('Failed to analyze response. Please try again.')
    }
    setAiAction(null)
  }

  const handleExportTypes = async () => {
    if (!isJson) return
    if (isTooBig) {
      setSizeLimitWarning(true)
    }
    setAiAction('types')
    setTypesPanel(null)
    try {
      const { data } = await generateAiTypes(response?.body)
      setTypesPanel(data.types)
    } catch {
      alert('Failed to generate TypeScript types.')
    }
    setAiAction(null)
  }

  if (!response) return null

  const tabs = [
    { id: 'pretty',  label: 'Pretty',  icon: <FiCode    size={13} /> },
    ...(isHtml ? [{ id: 'preview', label: 'Preview', icon: <FiMonitor size={13} /> }] : []),
    { id: 'raw',     label: 'Raw',     icon: <FiFileText size={13} /> },
    { id: 'headers', label: 'Headers', icon: <FiInfo    size={13} /> },
  ]

  const sharedProps = {
    response, requestDetails, contentType, rawBody, isHtml, isJson,
    viewMode, setViewMode, iframeRef, tabs,
    aiAction, handleAnalyzeBugs, handleExportTypes,
    handleCopyRaw, copied, statusBadge,
    bugReport, setBugReport, typesPanel, setTypesPanel,
    sizeLimitWarning, setSizeLimitWarning, bodyLen,
    fullscreen, setFullscreen,
  }

  return (
    <>
      {/* Inline viewer */}
      {!fullscreen && (
        <div className="mt-6">
          <ViewerContent {...sharedProps} />
        </div>
      )}

      {/* Fullscreen overlay */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400">Response — Fullscreen View</span>
            <button
              onClick={() => setFullscreen(false)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              <FiMinimize2 size={13} /> Exit Fullscreen
              <kbd className="ml-1 rounded bg-slate-700 px-1 py-0.5 text-[10px] text-slate-400">Esc</kbd>
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <ViewerContent {...sharedProps} />
          </div>
        </div>
      )}
    </>
  )
}