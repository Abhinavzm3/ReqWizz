// src/components/CollectionSelector.jsx
import { useState } from 'react';
import { FiPlus, FiChevronDown, FiFolder, FiCheck } from 'react-icons/fi';

const CollectionSelector = ({ collections, selectedCollection, onSelectCollection, onCreateCollection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  
  const handleCreate = (e) => {
    e.stopPropagation();
    if (newCollectionName.trim()) {
      onCreateCollection(newCollectionName);
      setNewCollectionName('');
    }
  };

  return (
    <div className="relative mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <div className="flex items-center">
          {selectedCollection ? (
            <>
              <FiFolder className="text-blue-500 mr-2" />
              <span className="truncate max-w-xs">{selectedCollection.name}</span>
            </>
          ) : (
            <span className="text-gray-500">Select a collection</span>
          )}
        </div>
        <FiChevronDown className={`transform ${isOpen ? 'rotate-180' : ''} transition-transform`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b">
            <div className="flex mb-1">
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="New collection name"
                className="flex-grow px-3 py-1.5 text-sm border border-gray-300 rounded-l focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={handleCreate}
                disabled={!newCollectionName.trim()}
                className={`px-3 py-1.5 text-sm rounded-r ${
                  !newCollectionName.trim() 
                    ? 'bg-gray-200 text-gray-500' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <FiPlus size={16} />
              </button>
            </div>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {collections.map(collection => (
              <button
                key={collection._id}
                onClick={() => {
                  onSelectCollection(collection);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-blue-50 ${
                  selectedCollection?._id === collection._id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center">
                  <FiFolder className="text-blue-500 mr-2" />
                  <span className="truncate max-w-xs">{collection.name}</span>
                </div>
                {selectedCollection?._id === collection._id && (
                  <FiCheck className="text-blue-600" />
                )}
              </button>
            ))}
            
            {collections.length === 0 && (
              <div className="px-4 py-3 text-center text-sm text-gray-500">
                No collections found. Create your first collection.
              </div>
            )}
          </div>
        </div>
      )}
      
      {selectedCollection && (
        <div className="mt-2 flex items-center">
          <span className="text-sm text-gray-600 mr-2">Saving to:</span>
          <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
            <FiFolder className="text-blue-500 mr-1" size={14} />
            <span className="font-medium text-blue-700">{selectedCollection.name}</span>
          </div>
          <button 
            onClick={() => onSelectCollection(null)}
            className="ml-2 text-xs text-red-600 hover:text-red-800"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};

export default CollectionSelector;