// src/services/api.js
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL 


export const sendRequest = (data) => axios.post(`${API_URL}/send-request`, data);
export const getHistory = (_id) => axios.get(`${API_URL}/history`, { params: { _id } });
export const getCollections = (_id) => axios.get(`${API_URL}/collections?user_id=${_id}`);
export const createCollection = (data) => axios.post(`${API_URL}/collections`, data);
export const updateCollection = (id, data) => axios.put(`${API_URL}/collections/${id}`, data);
export const deleteHistoryEntry = (id) => axios.post(`${API_URL}/history/delete`, { id });
export const deleteCollection = (id) => axios.delete(`${API_URL}/collections/${id}`);
export const deleteRequestFromCollection = (collectionId, requestId) =>
  axios.delete(`${API_URL}/collections/${collectionId}/requests/${requestId}`);
export const addRequestToCollection = (collectionId, requestData,user_id) => {
return axios.post(`${API_URL}/collections/${collectionId}/requests`, {
  ...requestData,
  user_id,
});
};

export const generateAiRequest = (prompt) => axios.post(`${API_URL}/ai/generate-request`, { prompt });
export const debugAiError = (requestDetails, errorResponse) => axios.post(`${API_URL}/ai/debug-error`, { requestDetails, errorResponse });
export const generateAiTypes = (responseBody) => axios.post(`${API_URL}/ai/generate-types`, { responseBody });
export const generateAiDocs = (collectionName, requests) => axios.post(`${API_URL}/ai/generate-docs`, { collectionName, requests });