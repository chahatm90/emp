import axios from 'axios';

const EMPLOYEE_BASE = import.meta.env.VITE_EMPLOYEE_SERVICE_URL || '';
const DEPARTMENT_BASE = import.meta.env.VITE_DEPARTMENT_SERVICE_URL || '';

const employeeApi = axios.create({ baseURL: EMPLOYEE_BASE, timeout: 15000, headers: { 'Content-Type': 'application/json' } });
const departmentApi = axios.create({ baseURL: DEPARTMENT_BASE, timeout: 15000, headers: { 'Content-Type': 'application/json' } });

const handleError = (err) => Promise.reject(new Error(err.response?.data?.message || err.message || 'An error occurred'));
employeeApi.interceptors.response.use(r => r, handleError);
departmentApi.interceptors.response.use(r => r, handleError);

export const employees = {
  getAll: () => employeeApi.get('/api/v1/employees'),
  getById: (id) => employeeApi.get(`/api/v1/employees/${id}`),
  getByDepartment: (id) => employeeApi.get(`/api/v1/employees/department/${id}`),
  create: (data) => employeeApi.post('/api/v1/employees', data),
  update: (id, data) => employeeApi.put(`/api/v1/employees/${id}`, data),
  delete: (id) => employeeApi.delete(`/api/v1/employees/${id}`),
  count: () => employeeApi.get('/api/v1/employees/count'),
};

export const departments = {
  getAll: () => departmentApi.get('/api/v1/departments'),
  getById: (id) => departmentApi.get(`/api/v1/departments/${id}`),
  create: (data) => departmentApi.post('/api/v1/departments', data),
  update: (id, data) => departmentApi.put(`/api/v1/departments/${id}`, data),
};
