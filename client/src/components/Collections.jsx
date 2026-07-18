import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FiEdit, FiExternalLink, FiFolder, FiPlus, FiRefreshCw, FiSearch, FiTrash2, FiFileText, FiX, FiCopy } from 'react-icons/fi'
import { createCollection, deleteCollection, deleteRequestFromCollection, getCollections, updateCollection, generateAiDocs } from '../services/Api'

export default function Collections() {
  const [collections, setCollections] = useState([])
  const [newCollectionName, setNewCollectionName] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingCollection, setEditingCollection] = useState(null)
  const [editName, setEditName] = useState('')
  const [aiLoadingColId, setAiLoadingColId] = useState(null)
  const [aiDocs, setAiDocs] = useState(null)
  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const userId = user?._id

  const fetchCollections = useCallback(async () => {
    setLoading(true)
    if (!userId) {
      setCollections([])
      setLoading(false)
      return
    }

    try {
      const { data } = await getCollections(userId)
      setCollections(data)
    } catch (error) {
      console.error('Failed to fetch collections', error)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchCollections()
  }, [fetchCollections])

  const handleCreate = async () => {
    if (!newCollectionName.trim()) return

    try {
      const { data } = await createCollection({
        name: newCollectionName,
        requests: [],
        user_id: userId,
      })
      setCollections([...collections, data])
      setNewCollectionName('')
    } catch (error) {
      console.error('Failed to create collection', error)
    }
  }

  const handleDeleteCollection = async (id) => {
    if (window.confirm('Are you sure you want to delete this collection? All requests will be lost.')) {
      try {
        await deleteCollection(id)
        setCollections(collections.filter((c) => c._id !== id))
      } catch (error) {
        console.error('Failed to delete collection', error)
      }
    }
  }

  const handleDeleteRequest = async (collectionId, requestId) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        await deleteRequestFromCollection(collectionId, requestId)
        const updatedCollections = collections.map((collection) => {
          if (collection._id === collectionId) {
            return {
              ...collection,
              requests: collection.requests.filter((req) => req._id !== requestId),
            }
          }
          return collection
        })
        setCollections(updatedCollections)
      } catch (error) {
        console.error('Failed to delete request', error)
      }
    }
  }

  const handleOpenInComposer = (request, collectionId) => {
    navigate('/main', {
      state: {
        activeTab: 'composer',
        requestData: request,
        collectionId,
      },
    })
  }

  const handleAddRequest = (collectionId) => {
    navigate('/main', {
      state: {
        activeTab: 'composer',
        collectionId,
      },
    })
  }

  const handleStartEdit = (collection) => {
    setEditingCollection(collection._id)
    setEditName(collection.name)
  }

  const handleSaveEdit = async (collectionId) => {
    if (!editName.trim()) return

    try {
      const { data } = await updateCollection(collectionId, { name: editName })
      const updatedCollections = collections.map((collection) => {
        if (collection._id === collectionId) {
          return { ...collection, name: data.name }
        }
        return collection
      })
      setCollections(updatedCollections)
      setEditingCollection(null)
    } catch (error) {
      console.error('Failed to update collection', error)
    }
  }

  const handleGenerateDocs = async (collection) => {
    setAiLoadingColId(collection._id)
    try {
      const { data } = await generateAiDocs(collection.name, collection.requests || [])
      setAiDocs({ collectionName: collection.name, content: data.docs })
    } catch (error) {
      alert('Failed to generate documentation')
    }
    setAiLoadingColId(null)
  }

  const filteredCollections = collections.filter(
    (collection) =>
      collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (collection.requests &&
        collection.requests.some(
          (req) => req.name.toLowerCase().includes(searchTerm.toLowerCase()) || req.url.toLowerCase().includes(searchTerm.toLowerCase())
        ))
  )

  const getMethodColor = (method) => {
    switch (method) {
      case 'GET':
        return 'bg-emerald-100 text-emerald-700'
      case 'POST':
        return 'bg-sky-100 text-sky-700'
      case 'PUT':
        return 'bg-amber-100 text-amber-700'
      case 'DELETE':
        return 'bg-rose-100 text-rose-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Collections</h2>
          <p className="text-sm text-slate-500">{filteredCollections.length} collections</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={fetchCollections}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
          <div className="relative sm:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search"
              className="h-10 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            placeholder="New collection name"
            className="h-10 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          <button
            onClick={handleCreate}
            disabled={!newCollectionName.trim()}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold text-white ${
              !newCollectionName.trim() ? 'bg-slate-300' : 'bg-slate-950 hover:bg-slate-800'
            }`}
          >
            <FiPlus size={16} />
            Create
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
        </div>
      ) : filteredCollections.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <FiFolder size={22} />
          </div>
          <p className="font-medium text-slate-700">No collections found</p>
          <p className="mt-1 text-sm text-slate-500">Create a collection to organize saved requests.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200">
          {filteredCollections.map((collection) => (
            <section key={collection._id} className="px-5 py-4">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                    <FiFolder size={18} />
                  </div>
                  {editingCollection === collection._id ? (
                    <div className="flex min-w-0 items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-9 min-w-0 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                      />
                      <button onClick={() => handleSaveEdit(collection._id)} className="h-9 rounded-md bg-slate-950 px-3 text-sm font-semibold text-white">
                        Save
                      </button>
                      <button onClick={() => setEditingCollection(null)} className="h-9 rounded-md px-3 text-sm font-medium text-slate-600 hover:bg-slate-100">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-slate-900">{collection.name}</h3>
                      <p className="text-sm text-slate-500">{collection.requests?.length || 0} requests</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleStartEdit(collection)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    aria-label="Edit collection"
                  >
                    <FiEdit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteCollection(collection._id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                    aria-label="Delete collection"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>

              {!collection.requests || collection.requests.length === 0 ? (
                <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                  This collection does not have any requests yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {collection.requests.map((req) => (
                    <div key={req._id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="mb-2 flex items-center gap-2">
                            <span className={`rounded px-2 py-1 text-xs font-semibold ${getMethodColor(req.method)}`}>{req.method}</span>
                            <h4 className="truncate text-sm font-semibold text-slate-900">{req.name}</h4>
                          </div>
                          <p className="truncate text-sm text-slate-600">{req.url}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteRequest(collection._id, req._id)}
                          className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          aria-label="Delete request"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-slate-500">{new Date(req.createdAt).toLocaleDateString()}</span>
                        <button onClick={() => handleOpenInComposer(req, collection._id)} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-950">
                          <FiExternalLink size={13} />
                          Open
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => handleAddRequest(collection._id)}
                  className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Add request
                </button>
                <button
                  onClick={() => handleGenerateDocs(collection)}
                  disabled={aiLoadingColId === collection._id}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-indigo-50 border border-indigo-200 px-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                >
                  <FiFileText size={15} />
                  {aiLoadingColId === collection._id ? 'Generating...' : '✨ Generate Docs'}
                </button>
              </div>
            </section>
          ))}
        </div>
      )}

      {aiDocs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="font-semibold text-slate-900">Docs: {aiDocs.collectionName}</h3>
              <div className="flex gap-2">
                <button onClick={() => navigator.clipboard.writeText(aiDocs.content)} className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200">
                  <FiCopy size={14} /> Copy
                </button>
                <button onClick={() => setAiDocs(null)} className="inline-flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 p-1.5">
                  <FiX size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-5 bg-slate-50">
              <pre className="whitespace-pre-wrap break-words text-sm font-mono text-slate-800">{aiDocs.content}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}