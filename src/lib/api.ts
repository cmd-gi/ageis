// API service layer for backend communication
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Set auth token in localStorage
export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

// Remove auth token from localStorage
export const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

// Auth API
export const authAPI = {
  signup: async (data: { email: string; username: string; password: string; confirmPassword: string }) => {
    return apiRequest<{ token: string; user: any }>('/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: async (data: { emailOrUsername: string; password: string }) => {
    return apiRequest<{ token: string; user: any }>('/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getProfile: async () => {
    return apiRequest<any>('/profile', {
      method: 'GET',
    });
  },

  updateProfile: async (data: { username?: string; email?: string; password?: string }) => {
    return apiRequest<any>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Tasks API (example entity)
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export const tasksAPI = {
  getAll: async (search?: string) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiRequest<Task[]>(`/tasks${query}`, {
      method: 'GET',
    });
  },

  getById: async (id: string) => {
    return apiRequest<Task>(`/tasks/${id}`, {
      method: 'GET',
    });
  },

  create: async (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    return apiRequest<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => {
    return apiRequest<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiRequest<void>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};
