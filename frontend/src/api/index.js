// src/api/client.js
import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";
const client = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});
const refreshClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

let authHandlers = {
  onRefresh: null,
  onLogout: null,
};
let refreshPromise = null;

function parseStoredUser() {
  try {
    const stored = localStorage.getItem("srams_user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveAuthData(token, refreshToken) {
  const storedUser = parseStoredUser();
  if (!storedUser) return;
  const updatedUser = {
    ...storedUser,
    token,
    refreshToken,
  };
  localStorage.setItem("srams_token", token);
  localStorage.setItem("srams_user", JSON.stringify(updatedUser));
  if (authHandlers.onRefresh) authHandlers.onRefresh(token, refreshToken);
}

function clearAuthData() {
  localStorage.removeItem("srams_token");
  localStorage.removeItem("srams_user");
  if (authHandlers.onLogout) authHandlers.onLogout();
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

export function registerAuthHandlers(handlers) {
  authHandlers = { ...authHandlers, ...handlers };
}

// Attach JWT on every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("srams_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — attempt refresh if possible, otherwise logout
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    if (status === 401 && originalRequest && !originalRequest._retry) {
      const storedUser = parseStoredUser();
      const refreshToken = storedUser?.refreshToken;

      if (refreshToken) {
        originalRequest._retry = true;
        if (!refreshPromise) {
          refreshPromise = refreshClient
            .post("/auth/refresh", { refreshToken })
            .then((refreshResponse) => {
              const { token: newToken, refreshToken: newRefreshToken } =
                refreshResponse.data;
              saveAuthData(newToken, newRefreshToken || refreshToken);
              return newToken;
            })
            .catch((refreshError) => {
              clearAuthData();
              return Promise.reject(refreshError);
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        const newToken = await refreshPromise;
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return client(originalRequest);
        }
      }

      clearAuthData();
    }

    if (status >= 500) {
      console.error(
        "Server error:",
        error.response.status,
        error.response.data,
      );
    }

    return Promise.reject(error);
  },
);

export default client;

// ============================================================
// Auth API
// ============================================================
const realAuthApi = {
  login: (data) => client.post("/auth/login", data),
  refresh: (refreshToken) =>
    refreshClient.post("/auth/refresh", { refreshToken }),
  changePassword: (data) => client.put("/auth/change-password", data),
};
export const authApi = realAuthApi;

// ============================================================
// Students API
// ============================================================
const realStudentsApi = {
  list: (params) => client.get("/students", { params }),
  getById: (id) => client.get(`/students/${id}`),
  getByUsid: (usid) => client.get(`/students/usid/${usid}`),
  create: (data) => client.post("/students", data),
  update: (id, data) => client.put(`/students/${id}`, data),
};
export const studentsApi = realStudentsApi;

// ============================================================
// Attendance API
// ============================================================
const realAttendanceApi = {
  mark: (data) => client.post("/attendance", data),
  markBulk: (data) => client.post("/attendance/bulk", data),
  getClassAttendance: (params) => client.get("/attendance/class", { params }),
  getStudentByTerm: (studentId, termId) =>
    client.get(`/attendance/student/${studentId}/term/${termId}`),
  getStudentSummary: (studentId, termId) =>
    client.get(`/attendance/student/${studentId}/term/${termId}/summary`),
  getSchoolReport: (schoolId, params) =>
    client.get(`/attendance/school/${schoolId}/report`, { params }),
};
export const attendanceApi = realAttendanceApi;

// ============================================================
// Academic Performance API
// ============================================================
const realPerformanceApi = {
  recordScore: (data) => client.post("/performance", data),
  getStudentResults: (studentId, termId) =>
    client.get(`/performance/student/${studentId}/term/${termId}`),
  getReportCard: (studentId, termId) =>
    client.get(`/performance/student/${studentId}/term/${termId}/report-card`),
  getClassResults: (params) => client.get("/performance/class", { params }),
};
export const performanceApi = realPerformanceApi;

// ============================================================
// Transfers API
// ============================================================
const realTransfersApi = {
  initiate: (data) => client.post("/transfers", data),
  approveSending: (id) => client.put(`/transfers/${id}/approve-sending`),
  confirmReceiving: (id) => client.put(`/transfers/${id}/confirm-receiving`),
  complete: (id) => client.put(`/transfers/${id}/complete`),
  reject: (id, reason) => client.put(`/transfers/${id}/reject`, { reason }),
  getByStudent: (studentId) => client.get(`/transfers/student/${studentId}`),
  getBySchool: (schoolId, params) =>
    client.get(`/transfers/school/${schoolId}`, { params }),
  getById: (id) => client.get(`/transfers/${id}`),
};
export const transfersApi = realTransfersApi;

// ============================================================
// Schools API
// ============================================================
const realSchoolsApi = {
  list: (params) => client.get("/schools", { params }),
  getById: (id) => client.get(`/schools/${id}`),
  create: (data) => client.post("/schools", data),
  update: (id, data) => client.put(`/schools/${id}`, data),
  getByRegion: (regionId) => client.get(`/schools/region/${regionId}`),
};
export const schoolsApi = realSchoolsApi;

// ============================================================
// Users API
// ============================================================
const realUsersApi = {
  create: (data) => client.post("/users", data),
  list: (params) => client.get("/users", { params }),
  getById: (id) => client.get(`/users/${id}`),
  update: (id, data) => client.put(`/users/${id}`, data),
  deactivate: (id) => client.put(`/users/${id}/deactivate`),
};
export const usersApi = realUsersApi;

// ============================================================
// Reference Data API
// ============================================================
const realReferenceApi = {
  getRegions: () => client.get("/regions"),
  getGradeLevels: () => client.get("/grade-levels"),
  getSubjects: () => client.get("/subjects"),
  getAcademicYears: () => client.get("/academic-years"),
  getCurrentYear: () => client.get("/academic-years/current"),
  getTerms: (yearId) => client.get(`/academic-years/${yearId}/terms`),
};
export const referenceApi = realReferenceApi;

