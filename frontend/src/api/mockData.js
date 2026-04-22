// src/api/mockData.js

export const ROLES = {
  ADMIN: "ADMIN",
  SCHOOL_ADMIN: "SCHOOL_ADMIN",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
};

export const MOCK_USER = {
  admin: {
    token: "mock-admin-token",
    refreshToken: "mock-admin-refresh-token",
    role: ROLES.ADMIN,
    fullName: "System Administrator",
    username: "admin",
  },
  schoolAdmin: {
    token: "mock-school-admin-token",
    refreshToken: "mock-school-admin-refresh-token",
    role: ROLES.SCHOOL_ADMIN,
    fullName: "John Doe (School Admin)",
    username: "schooladmin",
    schoolId: "1",
  },
  teacher: {
    token: "mock-teacher-token",
    refreshToken: "mock-teacher-refresh-token",
    role: ROLES.TEACHER,
    fullName: "Jane Smith (Teacher)",
    username: "teacher",
    schoolId: "1",
  },
  student: {
    token: "mock-student-token",
    refreshToken: "mock-student-refresh-token",
    role: ROLES.STUDENT,
    fullName: "Samuel Student",
    username: "student",
    studentId: "101",
    schoolId: "1",
  },
};

export const MOCK_SCHOOLS = [
  { id: "1", name: "Green Valley High", region: "Northern", type: "Secondary", address: "123 Valley St" },
  { id: "2", name: "Riverside Elementary", region: "Central", type: "Primary", address: "456 River Rd" },
  { id: "3", name: "Mountain View Academy", region: "Western", type: "Combined", address: "789 Mountain Way" },
];

export const MOCK_STUDENTS = [
  { id: "101", usid: "S1001", fullName: "Samuel Student", gender: "Male", dateOfBirth: "2008-05-15", schoolId: "1", gradeLevelId: "9", status: "ACTIVE" },
  { id: "102", usid: "S1002", fullName: "Alice Johnson", gender: "Female", dateOfBirth: "2009-02-20", schoolId: "1", gradeLevelId: "8", status: "ACTIVE" },
  { id: "103", usid: "S1003", fullName: "Bob Miller", gender: "Male", dateOfBirth: "2007-11-10", schoolId: "2", gradeLevelId: "6", status: "INACTIVE" },
  { id: "104", usid: "S1004", fullName: "Charlie Brown", gender: "Male", dateOfBirth: "2010-08-30", schoolId: "1", gradeLevelId: "7", status: "ACTIVE" },
];

export const MOCK_GRADE_LEVELS = [
  { id: "1", name: "Grade 1" },
  { id: "2", name: "Grade 2" },
  { id: "3", name: "Grade 3" },
  { id: "4", name: "Grade 4" },
  { id: "5", name: "Grade 5" },
  { id: "6", name: "Grade 6" },
  { id: "7", name: "Grade 7" },
  { id: "8", name: "Grade 8" },
  { id: "9", name: "Grade 9" },
  { id: "10", name: "Grade 10" },
  { id: "11", name: "Grade 11" },
  { id: "12", name: "Grade 12" },
];

export const MOCK_REGIONS = [
  { id: "1", name: "Northern" },
  { id: "2", name: "Southern" },
  { id: "3", name: "Eastern" },
  { id: "4", name: "Western" },
  { id: "5", name: "Central" },
];

export const MOCK_SUBJECTS = [
  { id: "1", name: "Mathematics" },
  { id: "2", name: "English Language" },
  { id: "3", name: "Science" },
  { id: "4", name: "Social Studies" },
  { id: "5", name: "Physical Education" },
];

export const MOCK_ACADEMIC_YEARS = [
  { id: "1", name: "2023/2024", isCurrent: false },
  { id: "2", name: "2024/2025", isCurrent: true },
];

export const MOCK_TERMS = [
  { id: "1", name: "Term 1", yearId: "2" },
  { id: "2", name: "Term 2", yearId: "2" },
  { id: "3", name: "Term 3", yearId: "2" },
];

export const MOCK_ATTENDANCE = [
  { id: "1", studentId: "101", date: "2024-03-20", status: "PRESENT" },
  { id: "2", studentId: "101", date: "2024-03-21", status: "ABSENT" },
  { id: "3", studentId: "102", date: "2024-03-20", status: "PRESENT" },
];

export const MOCK_PERFORMANCE = [
  { id: "1", studentId: "101", subjectId: "1", termId: "1", score: 85, grade: "A" },
  { id: "2", studentId: "101", subjectId: "2", termId: "1", score: 78, grade: "B" },
  { id: "3", studentId: "102", subjectId: "1", termId: "1", score: 92, grade: "A+" },
];

export const MOCK_TRANSFERS = [
  { id: "1", studentId: "104", studentName: "Charlie Brown", fromSchoolId: "2", toSchoolId: "1", status: "PENDING", requestDate: "2024-03-15" },
];
