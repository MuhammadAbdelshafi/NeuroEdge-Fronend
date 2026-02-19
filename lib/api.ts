import axios from 'axios';

// Create an Axios instance with default configuration
// Create an Axios instance with default configuration
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api/v1', // Fallback to local
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the JWT token if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token might be expired
            // TODO: Implement refresh token logic or redirect to login
            // localStorage.removeItem('token');
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const getPapers = async (skip = 0, limit = 20) => {
    const response = await api.get(`/papers/?skip=${skip}&limit=${limit}`);
    return response.data;
};

export const getFeed = async (
    page = 1,
    pageSize = 20,
    filters?: {
        subspecialties?: string[],
        research_types?: string[],
        journals?: string[],
        sort?: string,
        datePreset?: string,
        dateFrom?: Date,
        dateTo?: Date
    }
) => {
    let query = `/feed?page=${page}&page_size=${pageSize}`;
    if (filters?.subspecialties?.length) {
        filters.subspecialties.forEach(s => query += `&subspecialties=${encodeURIComponent(s)}`);
    }
    if (filters?.research_types?.length) {
        filters.research_types.forEach(t => query += `&research_types=${encodeURIComponent(t)}`);
    }
    if (filters?.journals?.length) {
        filters.journals.forEach(j => query += `&journals=${encodeURIComponent(j)}`);
    }
    if (filters?.sort) {
        query += `&sort=${filters.sort}`;
    }
    if (filters?.datePreset) {
        query += `&date_preset=${filters.datePreset}`;
    }
    if (filters?.dateFrom) {
        query += `&date_from=${filters.dateFrom.toISOString().split('T')[0]}`;
    }
    if (filters?.dateTo) {
        query += `&date_to=${filters.dateTo.toISOString().split('T')[0]}`;
    }
    const response = await api.get(query);
    return response.data;
};

export const getFilters = async () => {
    const response = await api.get("/filters");
    return response.data;
};

export const getUserPreferences = async () => {
    const response = await api.get("/me/preferences/");
    return response.data;
};

export const updateUser = async (data: { full_name?: string; phone?: string; workplace?: string }) => {
    // Split updates: workplace goes to profile, others to user auth
    const promises = [];

    if (data.full_name !== undefined || data.phone !== undefined) {
        promises.push(api.put("/auth/me", { full_name: data.full_name, phone: data.phone }));
    }

    if (data.workplace !== undefined) {
        promises.push(api.put("/me/profile/", { workplace: data.workplace }));
    }

    await Promise.all(promises);
    return true;
};

export const changePassword = async (data: { current_password: string; new_password: string }) => {
    const response = await api.post("/auth/change-password", data);
    return response.data;
};

// Favorites
export const addToFavorites = async (paperId: string) => {
    const response = await api.post(`/favorites/${paperId}`);
    return response.data;
};

export const removeFromFavorites = async (paperId: string) => {
    const response = await api.delete(`/favorites/${paperId}`);
    return response.data;
};

export const getFavorites = async (
    page = 1,
    pageSize = 20,
    filters?: {
        subspecialties?: string[],
        research_types?: string[],
        journals?: string[],
        sort?: string,
        datePreset?: string,
        dateFrom?: Date,
        dateTo?: Date
    }
) => {
    let query = `/favorites/?page=${page}&page_size=${pageSize}`;
    if (filters?.subspecialties?.length) {
        filters.subspecialties.forEach(s => query += `&subspecialties=${encodeURIComponent(s)}`);
    }
    if (filters?.research_types?.length) {
        filters.research_types.forEach(t => query += `&research_types=${encodeURIComponent(t)}`);
    }
    if (filters?.journals?.length) {
        filters.journals.forEach(j => query += `&journals=${encodeURIComponent(j)}`);
    }
    if (filters?.sort) {
        query += `&sort=${filters.sort}`;
    }
    if (filters?.datePreset) {
        query += `&date_preset=${filters.datePreset}`;
    }
    if (filters?.dateFrom) {
        query += `&date_from=${filters.dateFrom.toISOString().split('T')[0]}`;
    }
    if (filters?.dateTo) {
        query += `&date_to=${filters.dateTo.toISOString().split('T')[0]}`;
    }

    const response = await api.get(query);
    return response.data;
};

export default api;
