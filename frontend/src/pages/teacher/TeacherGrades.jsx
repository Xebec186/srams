import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { studentsApi, performanceApi, referenceApi } from "../../api";
import { PageHeader, Spinner, StatCard } from "../../components/common";

export default function TeacherGrades() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load reference data
  useEffect(() => {
    async function loadRef() {
      try {
        const [gRes, sRes, yRes] = await Promise.all([
          referenceApi.getGradeLevels(),
          referenceApi.getSubjects(),
          referenceApi.getCurrentYear(),
        ]);
        setGrades(gRes.data);
        setSubjects(sRes.data);
        const tRes = await referenceApi.getTerms(yRes.data.id);
        setTerms(tRes.data);
        if (tRes.data.length) {
          // Default to current term if possible, otherwise last term
          const current = tRes.data.find(t => new Date() >= new Date(t.startDate) && new Date() <= new Date(t.endDate));
          setSelectedTerm(String(current ? current.id : tRes.data[tRes.data.length - 1].id));
        }
      } catch (err) {
        toastError("Failed to load reference data.");
      }
    }
    loadRef();
  }, [toastError]);

  // Load students and existing grades
  const loadData = useCallback(async () => {
    if (!selectedGrade || !user?.schoolId) return;
    
    setLoading(true);
    try {
      const [sRes, gRes] = await Promise.all([
        studentsApi.list({ schoolId: user.schoolId, gradeLevelId: selectedGrade, size: 100 }),
        selectedSubject && selectedTerm 
          ? performanceApi.getClassResults({ 
              schoolId: user.schoolId, 
              gradeLevelId: selectedGrade, 
              termId: selectedTerm 
            })
          : Promise.resolve({ data: [] })
      ]);

      const list = sRes.data.content || [];
      setStudents(list);

      // Filter existing grades for the selected subject
      const existingGrades = (gRes.data || []).filter(g => String(g.subjectId) === String(selectedSubject));
      const gradeMap = {};
      existingGrades.forEach(g => {
        gradeMap[g.studentId] = {
          classScore: g.classScore !== null ? String(g.classScore) : "",
          examScore: g.examScore !== null ? String(g.examScore) : "",
          remarks: g.remarks || ""
        };
      });

      const init = {};
      list.forEach((s) => {
        init[s.id] = gradeMap[s.id] || { classScore: "", examScore: "", remarks: "" };
      });
      setScores(init);
    } catch (err) {
      toastError("Failed to load students or grades.");
    } finally {
      setLoading(false);
    }
  }, [selectedGrade, selectedSubject, selectedTerm, user?.schoolId, toastError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const setScore = (studentId, field, value) => {
    setScores((s) => ({
      ...s,
      [studentId]: { ...s[studentId], [field]: value },
    }));
  };

  const validateScores = () => {
    for (const sId in scores) {
      const { classScore, examScore } = scores[sId];
      if (classScore !== "" && (parseFloat(classScore) < 0 || parseFloat(classScore) > 30)) {
        return `Invalid class score for student. Must be between 0 and 30.`;
      }
      if (examScore !== "" && (parseFloat(examScore) < 0 || parseFloat(examScore) > 70)) {
        return `Invalid exam score for student. Must be between 0 and 70.`;
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!selectedSubject || !selectedTerm) {
      toastError("Please select a subject and term before submitting.");
      return;
    }

    const validationError = validateScores();
    if (validationError) {
      toastError(validationError);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        termId: Number(selectedTerm),
        subjectId: Number(selectedSubject),
        gradeLevelId: Number(selectedGrade),
        scores: students
          .filter(s => scores[s.id]?.classScore !== "" || scores[s.id]?.examScore !== "")
          .map(s => ({
            studentId: s.id,
            classScore: scores[s.id].classScore !== "" ? Number(scores[s.id].classScore) : null,
            examScore: scores[s.id].examScore !== "" ? Number(scores[s.id].examScore) : null,
            remarks: scores[s.id].remarks || null
          }))
      };

      if (payload.scores.length === 0) {
        toastError("No grades entered to save.");
        setSaving(false);
        return;
      }

      await performanceApi.recordScoresBulk(payload);
      success("Grades saved successfully.");
      loadData(); // Reload to get fresh data from server
    } catch (err) {
      toastError(err.response?.data?.message || "Failed to save grades.");
    } finally {
      setSaving(false);
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all entered scores on this page? This will not affect saved grades until you click Save.")) {
      const cleared = {};
      students.forEach(s => {
        cleared[s.id] = { classScore: "", examScore: "", remarks: "" };
      });
      setScores(cleared);
    }
  };

  // Stats calculation
  const enteredScores = Object.values(scores).filter(s => s.classScore !== "" || s.examScore !== "");
  const totalScores = enteredScores.map(s => (parseFloat(s.classScore) || 0) + (parseFloat(s.examScore) || 0));
  const average = totalScores.length > 0 ? totalScores.reduce((a, b) => a + b, 0) / totalScores.length : 0;
  const passCount = totalScores.filter(s => s >= 50).length;

  return (
    <div className="pb-10">
      <PageHeader
        title="Enter Grades"
        subtitle="Record class and exam scores for your students"
      />

      <div className="card mb-6">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="form-group mb-0">
              <label className="form-label">Grade Level</label>
              <select
                className="form-control"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
              >
                <option value="">Select grade...</option>
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Subject</label>
              <select
                className="form-control"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">Select subject...</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Term</label>
              <select
                className="form-control"
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
              >
                {terms.map((t) => (
                  <option key={t.id} value={t.id}>
                    Term {t.termNumber} ({t.academicYearLabel})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {!selectedGrade ? (
        <div className="card p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-900">Get Started</h3>
          <p className="text-neutral-500 max-w-xs mx-auto mt-2">
            Select a grade level, subject, and term to begin entering student grades.
          </p>
        </div>
      ) : loading ? (
        <Spinner center />
      ) : students.length === 0 ? (
        <div className="card p-12 text-center text-neutral-400">
          No students found in the selected grade.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Students" value={students.length} icon="users" color="blue" />
            <StatCard label="Grades Entered" value={enteredScores.length} icon="check" color="green" />
            <StatCard label="Class Average" value={average.toFixed(1)} icon="chart" color="amber" />
            <StatCard label="Pass Rate" value={enteredScores.length > 0 ? `${((passCount / enteredScores.length) * 100).toFixed(0)}%` : "0%"} icon="star" color="purple" />
          </div>

          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h3 className="card-title">Student List</h3>
              <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-wider text-neutral-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> Class (30%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Exam (70%)
                </span>
              </div>
            </div>
            <div className="table-wrapper">
              <table className="table-hover">
                <thead>
                  <tr>
                    <th className="w-12">#</th>
                    <th>Student Name</th>
                    <th>USID</th>
                    <th className="w-32">Class (/30)</th>
                    <th className="w-32">Exam (/70)</th>
                    <th className="w-24">Total</th>
                    <th className="w-24">Grade</th>
                    <th className="w-48">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => {
                    const sc = scores[s.id] || { classScore: "", examScore: "", remarks: "" };
                    const classVal = parseFloat(sc.classScore);
                    const examVal = parseFloat(sc.examScore);
                    const total = (!isNaN(classVal) || !isNaN(examVal))
                      ? (isNaN(classVal) ? 0 : classVal) + (isNaN(examVal) ? 0 : examVal)
                      : null;
                    const grade = total !== null ? computeGrade(total) : "—";
                    
                    const classInvalid = sc.classScore !== "" && (classVal < 0 || classVal > 30);
                    const examInvalid = sc.examScore !== "" && (examVal < 0 || examVal > 70);

                    return (
                      <tr key={s.id}>
                        <td className="text-neutral-400 text-sm">{i + 1}</td>
                        <td>
                          <div className="font-medium text-neutral-900">{s.fullName}</div>
                        </td>
                        <td>
                          <span className="usid-tag">{s.usid}</span>
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max="30"
                            step="0.5"
                            className={`form-control text-center ${classInvalid ? "border-red-500 bg-red-50 text-red-900" : ""}`}
                            value={sc.classScore}
                            onChange={(e) => setScore(s.id, "classScore", e.target.value)}
                            placeholder="0"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max="70"
                            step="0.5"
                            className={`form-control text-center ${examInvalid ? "border-red-500 bg-red-50 text-red-900" : ""}`}
                            value={sc.examScore}
                            onChange={(e) => setScore(s.id, "examScore", e.target.value)}
                            placeholder="0"
                          />
                        </td>
                        <td>
                          <span className={`font-bold text-lg ${total >= 50 ? "text-green-600" : total !== null ? "text-red-600" : "text-neutral-300"}`}>
                            {total !== null ? total.toFixed(1) : "—"}
                          </span>
                        </td>
                        <td>
                          {total !== null ? (
                            <span className={`grade-pill grade-${grade}`}>
                              {grade}
                            </span>
                          ) : (
                            <span className="text-neutral-300">—</span>
                          )}
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            value={sc.remarks}
                            onChange={(e) => setScore(s.id, "remarks", e.target.value)}
                            placeholder="Optional..."
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center border-t border-neutral-200 p-6 bg-neutral-50/50">
              <button
                className="btn btn-outline text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleClearAll}
                disabled={saving || loading}
              >
                Clear All
              </button>
              <div className="flex gap-3">
                <button
                  className="btn btn-outline"
                  onClick={() => loadData()}
                  disabled={saving || loading}
                >
                  Reset to Saved
                </button>
                <button
                  className="btn btn-primary px-8"
                  onClick={handleSubmit}
                  disabled={saving || loading}
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <Spinner size="sm" color="white" /> Saving...
                    </span>
                  ) : "Save All Grades"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function computeGrade(total) {
  if (total >= 80) return "A1";
  if (total >= 70) return "B2";
  if (total >= 60) return "B3";
  if (total >= 55) return "C4";
  if (total >= 50) return "C5";
  if (total >= 45) return "C6";
  if (total >= 40) return "D7";
  if (total >= 35) return "E8";
  return "F9";
}
