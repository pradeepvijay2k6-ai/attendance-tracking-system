import axios from 'axios';
import { supabase } from '../config/supabase';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5050/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to automatically attach the Supabase JWT token & Admin passcode
apiClient.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    const adminPasscode = sessionStorage.getItem('admin_passcode');
    if (adminPasscode) {
      config.headers['x-admin-passcode'] = adminPasscode;
    }
  } catch (err) {
    console.error('Error attaching auth headers to request:', err);
  }
  return config;
}, (error) => Promise.reject(error));

export async function verifyAdminPasscodeApi(passcode) {
  const response = await apiClient.post('/admin/verify-passcode', { passcode });
  return response.data;
}

// ==============================================================================
// TEACHER & ATTENDANCE APIS
// ==============================================================================
export async function getTodayTeacherClasses(dateStr) {
  const params = dateStr ? { date: dateStr } : {};
  const response = await apiClient.get('/timetable/teacher/today', { params });
  return response.data;
}

export async function getTimetableStudents(timetableId) {
  const response = await apiClient.get(`/timetable/${timetableId}/students`);
  return response.data;
}

export async function submitAttendanceApi(payload) {
  const response = await apiClient.post('/attendance/submit', payload);
  return response.data;
}

export async function getAttendanceSessionApi(sessionId) {
  const response = await apiClient.get(`/attendance/session/${sessionId}`);
  return response.data;
}

// ==============================================================================
// ADMIN APIS
// ==============================================================================
export async function getAdminStatsApi() {
  const response = await apiClient.get('/admin/stats');
  return response.data;
}

export async function getAdminStudentsApi(params) {
  const response = await apiClient.get('/admin/students', { params });
  return response.data;
}

export async function createStudentApi(studentData) {
  const response = await apiClient.post('/admin/students', studentData);
  return response.data;
}

export async function updateStudentApi(id, studentData) {
  const response = await apiClient.put(`/admin/students/${id}`, studentData);
  return response.data;
}

export async function deleteStudentApi(id) {
  const response = await apiClient.delete(`/admin/students/${id}`);
  return response.data;
}

export async function bulkUploadStudentsApi(students) {
  const response = await apiClient.post('/admin/students/bulk', { students });
  return response.data;
}

export async function getAdminTeachersApi() {
  const response = await apiClient.get('/admin/teachers');
  return response.data;
}

export async function createTeacherApi(teacherData) {
  const response = await apiClient.post('/admin/teachers', teacherData);
  return response.data;
}

export async function updateTeacherApi(id, teacherData) {
  const response = await apiClient.put(`/admin/teachers/${id}`, teacherData);
  return response.data;
}

export async function deleteTeacherApi(id) {
  const response = await apiClient.delete(`/admin/teachers/${id}`);
  return response.data;
}

export async function getAdminClassesApi() {
  const response = await apiClient.get('/admin/classes');
  return response.data;
}

export async function createClassApi(classData) {
  const response = await apiClient.post('/admin/classes', classData);
  return response.data;
}

export async function deleteClassApi(id) {
  const response = await apiClient.delete(`/admin/classes/${id}`);
  return response.data;
}

export async function getAdminSectionsApi() {
  const response = await apiClient.get('/admin/sections');
  return response.data;
}

export async function createSectionApi(sectionData) {
  const response = await apiClient.post('/admin/sections', sectionData);
  return response.data;
}

export async function deleteSectionApi(id) {
  const response = await apiClient.delete(`/admin/sections/${id}`);
  return response.data;
}

export async function getAdminSubjectsApi() {
  const response = await apiClient.get('/admin/subjects');
  return response.data;
}

export async function createSubjectApi(subjectData) {
  const response = await apiClient.post('/admin/subjects', subjectData);
  return response.data;
}

export async function deleteSubjectApi(id) {
  const response = await apiClient.delete(`/admin/subjects/${id}`);
  return response.data;
}

export async function getAdminDepartmentsApi() {
  const response = await apiClient.get('/admin/departments');
  return response.data;
}

export async function createDepartmentApi(deptData) {
  const response = await apiClient.post('/admin/departments', deptData);
  return response.data;
}

export async function deleteDepartmentApi(id) {
  const response = await apiClient.delete(`/admin/departments/${id}`);
  return response.data;
}

export async function getAdminTimetablesApi() {
  const response = await apiClient.get('/admin/timetables');
  return response.data;
}

export async function createTimetableApi(timetableData) {
  const response = await apiClient.post('/admin/timetables', timetableData);
  return response.data;
}

export async function updateTimetableApi(id, timetableData) {
  const response = await apiClient.put(`/admin/timetables/${id}`, timetableData);
  return response.data;
}

export async function deleteTimetableApi(id) {
  const response = await apiClient.delete(`/admin/timetables/${id}`);
  return response.data;
}

export async function getAdminSessionsApi() {
  const response = await apiClient.get('/admin/attendance-sessions');
  return response.data;
}

export async function deleteAdminSessionApi(id) {
  const response = await apiClient.delete(`/admin/attendance-sessions/${id}`);
  return response.data;
}

export async function resetSystemDataApi() {
  const response = await apiClient.post('/admin/system/reset-data');
  return response.data;
}

// ==============================================================================
// REPORTS, SWAPS & EXTRA CLASSES APIS
// ==============================================================================
export async function getDefaultersApi(threshold = 75.0, params = {}) {
  const response = await apiClient.get('/reports/defaulters', { params: { threshold, ...params } });
  return response.data;
}

export async function getMySwapsApi() {
  const response = await apiClient.get('/swaps/my-swaps');
  return response.data;
}

export async function createSwapRequestApi(swapData) {
  const response = await apiClient.post('/swaps/request', swapData);
  return response.data;
}

export async function respondSwapApi(id, status) {
  const response = await apiClient.put(`/swaps/${id}/respond`, { status });
  return response.data;
}

export async function getExtraClassesApi() {
  const response = await apiClient.get('/extra-classes');
  return response.data;
}

export async function scheduleExtraClassApi(data) {
  const response = await apiClient.post('/extra-classes/schedule', data);
  return response.data;
}

export default apiClient;
