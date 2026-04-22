// src/api/mockApi.js
import * as mockData from "./mockData";

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

const wrapResponse = (data) => ({ data });

export const authApi = {
  login: async ({ username }) => {
    await delay();
    if (username === "admin") return wrapResponse(mockData.MOCK_USER.admin);
    if (username === "schooladmin") return wrapResponse(mockData.MOCK_USER.schoolAdmin);
    if (username === "teacher") return wrapResponse(mockData.MOCK_USER.teacher);
    if (username === "student") return wrapResponse(mockData.MOCK_USER.student);
    // Default to admin for any other login to allow exploring
    return wrapResponse(mockData.MOCK_USER.admin);
  },
  refresh: async () => {
    await delay();
    return wrapResponse({ token: "new-mock-token", refreshToken: "new-mock-refresh-token" });
  },
  changePassword: async () => {
    await delay();
    return wrapResponse({ message: "Password changed successfully" });
  },
};

export const studentsApi = {
  list: async (params) => {
    await delay();
    let filtered = [...mockData.MOCK_STUDENTS];
    if (params?.schoolId) filtered = filtered.filter(s => s.schoolId === params.schoolId);
    return wrapResponse(filtered);
  },
  getById: async (id) => {
    await delay();
    const student = mockData.MOCK_STUDENTS.find(s => s.id === id);
    return wrapResponse(student);
  },
  getByUsid: async (usid) => {
    await delay();
    const student = mockData.MOCK_STUDENTS.find(s => s.usid === usid);
    return wrapResponse(student);
  },
  create: async (data) => {
    await delay();
    const newStudent = { ...data, id: Math.random().toString(36).substr(2, 9) };
    return wrapResponse(newStudent);
  },
  update: async (id, data) => {
    await delay();
    return wrapResponse({ ...data, id });
  },
};

export const attendanceApi = {
  mark: async (data) => {
    await delay();
    return wrapResponse(data);
  },
  markBulk: async (data) => {
    await delay();
    return wrapResponse(data);
  },
  getClassAttendance: async (params) => {
    await delay();
    return wrapResponse(mockData.MOCK_ATTENDANCE);
  },
  getStudentByTerm: async (studentId, termId) => {
    await delay();
    return wrapResponse(mockData.MOCK_ATTENDANCE.filter(a => a.studentId === studentId));
  },
  getStudentSummary: async (studentId, termId) => {
    await delay();
    return wrapResponse({ present: 15, absent: 2, late: 1 });
  },
  getSchoolReport: async (schoolId, params) => {
    await delay();
    return wrapResponse([]);
  },
};

export const performanceApi = {
  recordScore: async (data) => {
    await delay();
    return wrapResponse(data);
  },
  getStudentResults: async (studentId, termId) => {
    await delay();
    return wrapResponse(mockData.MOCK_PERFORMANCE.filter(p => p.studentId === studentId));
  },
  getReportCard: async (studentId, termId) => {
    await delay();
    return wrapResponse({
      student: mockData.MOCK_STUDENTS.find(s => s.id === studentId),
      results: mockData.MOCK_PERFORMANCE.filter(p => p.studentId === studentId),
      summary: { gpa: 3.5, totalCredits: 15 }
    });
  },
  getClassResults: async (params) => {
    await delay();
    return wrapResponse(mockData.MOCK_PERFORMANCE);
  },
};

export const transfersApi = {
  initiate: async (data) => {
    await delay();
    return wrapResponse({ ...data, id: "new-transfer-id", status: "PENDING" });
  },
  approveSending: async (id) => {
    await delay();
    return wrapResponse({ id, status: "APPROVED_SENDING" });
  },
  confirmReceiving: async (id) => {
    await delay();
    return wrapResponse({ id, status: "RECEIVED" });
  },
  complete: async (id) => {
    await delay();
    return wrapResponse({ id, status: "COMPLETED" });
  },
  reject: async (id, { reason }) => {
    await delay();
    return wrapResponse({ id, status: "REJECTED", reason });
  },
  getByStudent: async (studentId) => {
    await delay();
    return wrapResponse(mockData.MOCK_TRANSFERS.filter(t => t.studentId === studentId));
  },
  getBySchool: async (schoolId, params) => {
    await delay();
    return wrapResponse(mockData.MOCK_TRANSFERS);
  },
  getById: async (id) => {
    await delay();
    return wrapResponse(mockData.MOCK_TRANSFERS[0]);
  },
};

export const schoolsApi = {
  list: async (params) => {
    await delay();
    return wrapResponse(mockData.MOCK_SCHOOLS);
  },
  getById: async (id) => {
    await delay();
    return wrapResponse(mockData.MOCK_SCHOOLS.find(s => s.id === id));
  },
  create: async (data) => {
    await delay();
    return wrapResponse({ ...data, id: "new-school-id" });
  },
  update: async (id, data) => {
    await delay();
    return wrapResponse({ ...data, id });
  },
  getByRegion: async (regionId) => {
    await delay();
    return wrapResponse(mockData.MOCK_SCHOOLS);
  },
};

export const usersApi = {
  create: async (data) => {
    await delay();
    return wrapResponse({ ...data, id: "new-user-id" });
  },
  list: async (params) => {
    await delay();
    return wrapResponse([]);
  },
  getById: async (id) => {
    await delay();
    return wrapResponse({});
  },
  update: async (id, data) => {
    await delay();
    return wrapResponse({ ...data, id });
  },
  deactivate: async (id) => {
    await delay();
    return wrapResponse({ id, status: "DEACTIVATED" });
  },
};

export const referenceApi = {
  getRegions: async () => {
    await delay();
    return wrapResponse(mockData.MOCK_REGIONS);
  },
  getGradeLevels: async () => {
    await delay();
    return wrapResponse(mockData.MOCK_GRADE_LEVELS);
  },
  getSubjects: async () => {
    await delay();
    return wrapResponse(mockData.MOCK_SUBJECTS);
  },
  getAcademicYears: async () => {
    await delay();
    return wrapResponse(mockData.MOCK_ACADEMIC_YEARS);
  },
  getCurrentYear: async () => {
    await delay();
    return wrapResponse(mockData.MOCK_ACADEMIC_YEARS.find(y => y.isCurrent));
  },
  getTerms: async (yearId) => {
    await delay();
    return wrapResponse(mockData.MOCK_TERMS);
  },
};
