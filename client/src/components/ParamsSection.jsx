// src/components/ParamsSection.jsx
import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiCheck, FiX } from 'react-icons/fi';

const ParamsSection = ({ params, setParams, onParamsChange,base_url }) => {
  const [activeTab, setActiveTab] = useState('query');
  const [generatedUrl, setGeneratedUrl] = useState('');
  
  const updateParam = (index, field, value) => {
    const updated = [...params];
    updated[index][field] = value;
    setParams(updated);
  };

  const addParam = () => {
    setParams([...params, { key: '', value: '', enabled: true }]);
  };

  const removeParam = (index) => {
    const filtered = params.filter((_, i) => i !== index);
    setParams(filtered);
  };

  const toggleParam = (index) => {
    const updated = [...params];
    updated[index].enabled = !updated[index].enabled;
    setParams(updated);
  };

  // Generate URL with query parameters
  useEffect(() => {
    if (activeTab === 'query') {
      const enabledParams = params.filter(p => p.enabled && p.key);
      if (enabledParams.length === 0) {
        setGeneratedUrl('');
        return;
      }
      
      const queryString = enabledParams
        .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
        .join('&');
      
      setGeneratedUrl(`?${queryString}`);
      onParamsChange(queryString);
    }
  }, [params, activeTab, onParamsChange]);

  return (
    <div className="mb-6 border rounded-lg overflow-hidden">
      <div className="flex border-b">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'query' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('query')}
        >
          Query Parameters
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'preview' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('preview')}
        >
          Preview
        </button>
      </div>
      
      {activeTab === 'query' && (
        <div className="p-4">
          <div className="mb-3">
            <div className="grid grid-cols-12 gap-2 mb-1 text-xs text-gray-500 font-medium">
              <div className="col-span-1"></div>
              <div className="col-span-4">Key</div>
              <div className="col-span-6">Value</div>
              <div className="col-span-1">Action</div>
            </div>
            
            {params.map((param, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 mb-2">
                <div className="col-span-1 flex items-center justify-center">
                  <button 
                    onClick={() => toggleParam(i)}
                    className={`p-1 rounded ${
                      param.enabled 
                        ? 'text-green-600 bg-green-100 hover:bg-green-200' 
                        : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {param.enabled ? <FiCheck size={14} /> : <FiX size={14} />}
                  </button>
                </div>
                <input
                  placeholder="Key"
                  value={param.key}
                  onChange={(e) => updateParam(i, 'key', e.target.value)}
                  className="col-span-4 px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  placeholder="Value"
                  value={param.value}
                  onChange={(e) => updateParam(i, 'value', e.target.value)}
                  className="col-span-6 px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="col-span-1 flex items-center justify-center">
                  <button 
                    onClick={() => removeParam(i)}
                    className="p-1 text-gray-500 hover:text-red-600 rounded-md hover:bg-gray-100"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            
            <button
              onClick={addParam}
              className="flex items-center mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              <FiPlus className="mr-1" /> Add Parameter
            </button>
          </div>
        </div>
      )}
      
      {activeTab === 'preview' && generatedUrl && (
        <div className="p-4 bg-gray-50">
          <h3 className="font-medium text-gray-700 mb-2">Generated URL</h3>
          <div className="p-3 bg-white border border-gray-300 rounded-md font-mono text-sm break-all">
            <span className="text-blue-600">{base_url}</span>
            <span className="text-purple-600">{generatedUrl}</span>
          </div>
          
          <h3 className="font-medium text-gray-700 mt-4 mb-2">CURL Command</h3>
          <div className="p-3 bg-gray-800 text-gray-100 rounded-md font-mono text-sm overflow-x-auto">
            curl -X GET "<span className="text-green-400">{base_url}</span>
            <span className="text-yellow-300">{generatedUrl}</span>"
          </div>
        </div>
      )}
    </div>
  );
};

export default ParamsSection;