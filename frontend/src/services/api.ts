const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper to get authorization headers
const getHeaders = (isMultipart = false) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('hms_token') : null;
  const headers: HeadersInit = {};
  
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Generic fetch wrapper
const request = async (path: string, options: RequestInit = {}, isMultipart = false) => {
  const url = `${API_URL}${path}`;
  const headers = getHeaders(isMultipart);
  
  const config = {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {})
    }
  };

  const response = await fetch(url, config);

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hms_token');
      localStorage.removeItem('hms_user');
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please login again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }

  return response.json();
};

export const api = {
  // 1. Auth Services
  auth: {
    login: (credentials: any) => request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
    register: (userData: any) => request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
    getMe: () => request('/auth/me')
  },

  // 2. Patient Services
  patients: {
    list: (search = '', bloodGroup = '') => {
      let query = '';
      if (search || bloodGroup) {
        query = `?search=${encodeURIComponent(search)}&bloodGroup=${encodeURIComponent(bloodGroup)}`;
      }
      return request(`/patients${query}`);
    },
    get: (id: string) => request(`/patients/${id}`),
    recordVitals: (id: string, vitals: any) => request(`/patients/${id}/vitals`, {
      method: 'POST',
      body: JSON.stringify(vitals)
    })
  },

  // 3. Staff Services
  staff: {
    list: (role = '', department = '') => {
      let query = '';
      if (role || department) {
        query = `?role=${encodeURIComponent(role)}&department=${encodeURIComponent(department)}`;
      }
      return request(`/staff${query}`);
    },
    create: (staffData: any) => {
      const isFormData = staffData instanceof FormData;
      return request('/staff', {
        method: 'POST',
        body: isFormData ? staffData : JSON.stringify(staffData)
      }, isFormData);
    },
    update: (id: string, staffData: any) => {
      const isFormData = staffData instanceof FormData;
      return request(`/staff/${id}`, {
        method: 'PUT',
        body: isFormData ? staffData : JSON.stringify(staffData)
      }, isFormData);
    },
    delete: (id: string) => request(`/staff/${id}`, {
      method: 'DELETE'
    })
  },

  // 4. Appointment Services
  appointments: {
    list: () => request('/appointments'),
    create: (appointmentData: any) => request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    }),
    updateStatus: (id: string, statusData: any) => request(`/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(statusData)
    })
  },

  // 5. Bed Services
  beds: {
    list: () => request('/beds'),
    assign: (assignmentData: any) => request('/beds/assign', {
      method: 'POST',
      body: JSON.stringify(assignmentData)
    }),
    discharge: (bedId: string) => request(`/beds/discharge/${bedId}`, {
      method: 'POST'
    }),
    updateStatus: (bedId: string, status: string) => request(`/beds/${bedId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
  },

  // 6. Resource Inventory Services
  resources: {
    list: () => request('/resources'),
    create: (resourceData: any) => request('/resources', {
      method: 'POST',
      body: JSON.stringify(resourceData)
    }),
    update: (id: string, resourceData: any) => request(`/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(resourceData)
    })
  },

  // 7. Nurse Call Services
  nurseCalls: {
    list: () => request('/nurse-calls'),
    create: (callData: any) => request('/nurse-calls', {
      method: 'POST',
      body: JSON.stringify(callData)
    }),
    updateStatus: (id: string, status: string) => request(`/nurse-calls/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
  },

  // 8. Billing Services
  billing: {
    list: () => request('/billing'),
    create: (billData: any) => request('/billing', {
      method: 'POST',
      body: JSON.stringify(billData)
    }),
    pay: (id: string) => request(`/billing/${id}/pay`, {
      method: 'POST'
    })
  },

  // 9. Report Services
  reports: {
    list: () => request('/reports'),
    upload: (formData: FormData) => request('/reports', {
      method: 'POST',
      body: formData
    }, true)
  }
};
