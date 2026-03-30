import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/ai';

// Generate a unique session ID per page load so anyone can chat independently.
// On refresh, a new session is generated and the chat starts fresh.
const sessionId = 'session-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now().toString(36);

const api = axios.create({
    baseURL: API_BASE_URL,
});

export const sendMessage = async (message) => {
    try {
        const response = await api.post('/chat', { message, userId: sessionId });
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const uploadDocument = async (file) => {
    const formData = new FormData();
    formData.append('document', file);
    try {
        const response = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const getTasks = async () => {
    try {
        const response = await api.get('/tasks');
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        return [];
    }
};

export const toggleTaskStatus = async (id) => {
    try {
        const response = await api.patch(`/tasks/${id}/toggle`);
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const createTask = async (taskData) => {
    try {
        const response = await api.post('/tasks', taskData);
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const deleteTask = async (id) => {
    try {
        const response = await api.delete(`/tasks/${id}`);
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const getHistory = async () => {
    try {
        const response = await api.get('/chat/history');
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        return [];
    }
};

export default {
    sendMessage,
    uploadDocument,
    getTasks,
    toggleTaskStatus,
    createTask,
    deleteTask,
    getHistory,
};
