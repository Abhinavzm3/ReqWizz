import { useState } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import { toast } from 'react-toastify'
import {
  FiZap, FiPlay, FiChevronDown, FiChevronUp,
  FiCheck, FiX, FiLoader, FiClock, FiLink
} from 'react-icons/fi'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Axios instance that always sends cookies (for JWT auth)
const api = axios.create({ baseURL: API_URL, withCredentials: true })

const METHOD_COLORS = {
  GET:    'bg-emerald-100 text-emerald-700 border-emerald-200',
  POST:   'bg-sky-100 text-sky-700 border-sky-200',
  PUT:    'bg-amber-100 text-amber-700 border-amber-200',
  DELETE: 'bg-rose-100 text-rose-700 border-rose-200',
  PATCH:  'bg-purple-100 text-purple-700 border-purple-200',
}

const STATUS_COLOR = (s) => {
  if (!s) return 'text-slate-400'
  if (s >= 200 && s < 300) return 'text-emerald-600 font-semibold'
  if (s >= 400) return 'text-rose-600 font-semibold'
  return 'text-amber-600 font-semibold'
}

// ── Single Step Card ──────────────────────────────────────────────────────────
function StepCard({ step, state }) {
  const [open, setOpen] = useState(false)
  const methodColor = METHOD_COLORS[step.method?.toUpperCase()] || 'bg-slate-100 text-slate-700'

  const icon =
    state === 'running' ? <FiLoader size={16} className="animate-spin text-indigo-500" /> :
    state === 'done'    ? <FiCheck  size={16} className="text-emerald-500" /> :
    state === 'error'   ? <FiX      size={16} className="text-rose-500" /> :
                          <FiClock  size={16} className="text-slate-400" />

  const borderColor =
    state === 'running' ? 'border-indigo-300 shadow-indigo-100' :
    state === 'done'    ? 'border-emerald-300 shadow-emerald-50' :
    state === 'error'   ? 'border-rose-300 shadow-rose-50' :
                          'border-slate-200'

  return (
    <div className={`rounded-xl border bg-white shadow-sm transition-all ${borderColor}`}>
      {/* Header row */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
          {step.stepNumber}
        </span>
        {icon}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-800">{step.description}</p>
          <div className="mt-0.5 flex items-center gap-2">
            <span className={`rounded border px-1.5 py-0.5 text-xs font-bold ${methodColor}`}>
              {step.method}
            </span>
            <span className="truncate text-xs text-slate-500">{step.url}</span>
            {step.status && (
              <span className={`ml-auto text-xs ${STATUS_COLOR(step.status)}`}>
                {step.status}
              </span>
            )}
          </div>
        </div>
        {open ? <FiChevronUp size={16} className="flex-shrink-0 text-slate-400" /> :
                <FiChevronDown size={16} className="flex-shrink-0 text-slate-400" />}
      </button>

      {/* Expandable details */}
      {open && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-3">
          {/* Request details */}
          {step.headers && Object.keys(step.headers).length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-slate-400">Headers Sent</p>
              <pre className="rounded-md bg-slate-50 p-3 text-xs text-slate-700 overflow-auto">
                {JSON.stringify(step.headers, null, 2)}
              </pre>
            </div>
          )}
          {step.body && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-slate-400">Body Sent</p>
              <pre className="rounded-md bg-slate-50 p-3 text-xs text-slate-700 overflow-auto">
                {JSON.stringify(step.body, null, 2)}
              </pre>
            </div>
          )}

          {/* Response */}
          {step.response !== undefined && step.response !== null && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-slate-400">Response</p>
              <pre className="max-h-48 overflow-auto rounded-md bg-slate-900 p-3 text-xs text-emerald-300">
                {JSON.stringify(step.response, null, 2)}
              </pre>
            </div>
          )}

          {/* Extracted values */}
          {step.extracted && Object.keys(step.extracted).length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-slate-400">✨ Extracted Values</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(step.extracted).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs">
                    <span className="font-semibold text-indigo-700">{k}:</span>
                    <span className="text-indigo-500 max-w-40 truncate">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {step.error && (
            <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              ❌ {step.error}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main AgentPanel Component ─────────────────────────────────────────────────
export default function AgentPanel() {
  const [goal, setGoal] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [planning, setPlanning] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [plannedSteps, setPlannedSteps] = useState([])  // from AI plan
  const [results, setResults] = useState([])            // after execution
  const [currentStep, setCurrentStep] = useState(null)  // which step is running
  const [phase, setPhase] = useState('idle')            // idle | planned | done

  const exampleGoals = [
    'GET all posts from https://jsonplaceholder.typicode.com/posts, then GET the first post\'s user details',
    'POST a new post to https://jsonplaceholder.typicode.com/posts with title "Hello" and body "World", then GET the created post by its ID',
    'GET users from https://jsonplaceholder.typicode.com/users, then GET the todos for the first user',
  ]

  // ── Step 1: Plan ─────────────────────────────────────────────────────────
  const handlePlan = async () => {
    if (!goal.trim()) return
    setPlanning(true)
    setPlannedSteps([])
    setResults([])
    setPhase('idle')
    try {
      const { data } = await api.post(`/agent/plan`, { goal, baseUrl })
      if (!data.steps || data.steps.length === 0) {
        toast.warn('AI could not identify any API steps for this goal. Try being more specific.')
      } else {
        setPlannedSteps(data.steps)
        setPhase('planned')
        toast.success(`Planned ${data.steps.length} step(s)!`)
      }
    } catch (err) {
      console.error('Plan error:', err)
      const msg = err.response?.data?.error || err.message || 'Failed to plan the chain'
      toast.error(msg)
    }
    setPlanning(false)
  }

  // ── Step 2: Execute ───────────────────────────────────────────────────────
  const handleExecute = async () => {
    if (!plannedSteps.length) return
    setExecuting(true)
    setResults([])
    setPhase('planned')

    setCurrentStep(plannedSteps[0]?.stepNumber)

    try {
      const { data } = await api.post(`/agent/execute`, {
        steps: plannedSteps,
        baseUrl,
      })
      setResults(data.results || [])
      setPhase('done')
      toast.success('Chain execution complete!')
    } catch (err) {
      console.error('Execute error:', err)
      const msg = err.response?.data?.error || err.message || 'Execution failed'
      toast.error(msg)
    }
    setCurrentStep(null)
    setExecuting(false)
  }

  const getStepState = (stepNumber) => {
    if (executing && currentStep === stepNumber) return 'running'
    const result = results.find((r) => r.stepNumber === stepNumber)
    if (!result) return executing ? 'waiting' : 'planned'
    if (result.error || result.status === 0) return 'error'
    return 'done'
  }

  const successCount = results.filter((r) => r.status >= 200 && r.status < 300).length
  const failCount = results.filter((r) => r.status === 0 || r.status >= 400).length

  return (
    <div className="space-y-5">
      {/* ── Input Card ── */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <FiLink size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">API Chaining Agent</h2>
              <p className="text-xs text-slate-500">Describe a multi-step API workflow in plain English</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5">
          {/* Base URL */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">
              Base URL <span className="font-normal normal-case text-slate-400">(optional — prefix for relative paths)</span>
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.example.com"
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Goal */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">
              Your Goal
            </label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={3}
              placeholder='e.g. "Login with email test@gmail.com and password 1234, then use the token to fetch my profile"'
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
            />
          </div>

          {/* Example goals */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-slate-400">Try an example:</p>
            <div className="flex flex-wrap gap-2">
              {exampleGoals.map((eg, i) => (
                <button
                  key={i}
                  onClick={() => setGoal(eg)}
                  className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs text-indigo-700 hover:bg-indigo-100 transition text-left"
                >
                  {eg.length > 60 ? eg.slice(0, 60) + '…' : eg}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handlePlan}
              disabled={planning || !goal.trim()}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {planning
                ? <><FiLoader size={15} className="animate-spin" /> Planning…</>
                : <><FiZap size={15} /> Plan Steps</>
              }
            </button>

            {plannedSteps.length > 0 && (
              <button
                onClick={handleExecute}
                disabled={executing}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {executing
                  ? <><FiLoader size={15} className="animate-spin" /> Running…</>
                  : <><FiPlay size={15} /> Run Chain</>
                }
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Summary banner after execution ── */}
      {phase === 'done' && (
        <div className={`flex items-center gap-4 rounded-xl border px-5 py-3 ${
          failCount === 0
            ? 'border-emerald-200 bg-emerald-50'
            : 'border-amber-200 bg-amber-50'
        }`}>
          <span className="text-2xl">{failCount === 0 ? '🎉' : '⚠️'}</span>
          <div>
            <p className="font-semibold text-slate-800">
              Chain {failCount === 0 ? 'completed successfully!' : 'completed with errors'}
            </p>
            <p className="text-sm text-slate-500">
              {successCount} step{successCount !== 1 ? 's' : ''} succeeded
              {failCount > 0 && `, ${failCount} failed`}
            </p>
          </div>
        </div>
      )}

      {/* ── Step Cards ── */}
      {(plannedSteps.length > 0 || results.length > 0) && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">
            {phase === 'planned' && !executing ? `📋 ${plannedSteps.length} Steps Planned — click "Run Chain" to execute` : ''}
            {executing ? '⚡ Executing chain…' : ''}
            {phase === 'done' ? `✅ Execution Complete` : ''}
          </h3>

          {plannedSteps.map((step) => {
            const result = results.find((r) => r.stepNumber === step.stepNumber)
            // Merge plan info + result info for the card
            const merged = result ? { ...step, ...result } : step
            return (
              <StepCard
                key={step.stepNumber}
                step={merged}
                state={getStepState(step.stepNumber)}
              />
            )
          })}
        </div>
      )}

      {/* Empty state */}
      {phase === 'idle' && !planning && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-400">
            <FiLink size={26} />
          </div>
          <p className="font-semibold text-slate-700">No chain yet</p>
          <p className="mt-1 max-w-sm text-sm text-slate-400">
            Describe a multi-step API workflow above and click <strong>Plan Steps</strong> to let the AI break it down for you.
          </p>
        </div>
      )}
    </div>
  )
}
