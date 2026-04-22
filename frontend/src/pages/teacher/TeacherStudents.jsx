import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { studentsApi, referenceApi } from "../../api";
import {
  PageHeader,
  SearchBar,
  Spinner,
  Badge,
  EmptyState,
  Modal,
} from "../../components/common";
import { formatDate, getStatusBadgeClass } from "../../utils";
import StudentDetail from "../../components/students/StudentDetail";

export default function TeacherStudents() {
  const { user } = useAuth();
  const schoolId = user?.schoolId;

  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    referenceApi.getGradeLevels().then((r) => setGrades(r.data));
  }, []);

  const load = useCallback(async () => {
    if (!schoolId || !selectedGrade) return;
    setLoading(true);
    try {
      const res = await studentsApi.list({
        schoolId,
        gradeLevelId: selectedGrade,
        q: query,
        size: 100,
      });
      setStudents(res.data.content || []);
    } finally {
      setLoading(false);
    }
  }, [schoolId, selectedGrade, query]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = students.filter(
    (s) =>
      !query ||
      s.fullName?.toLowerCase().includes(query.toLowerCase()) ||
      s.usid?.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="My Students"
        subtitle="Students in your assigned class"
      />

      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="form-group mb-0">
          <label className="form-label">Grade Level</label>
          <select
            className="form-control min-w-[180px]"
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
          >
            <option value="">Select your class...</option>
            {grades.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
        {selectedGrade && (
          <div className="self-end">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search by name or USID..."
            />
          </div>
        )}
      </div>

      {!selectedGrade ? (
        <div className="card p-12 text-center text-neutral-400">
          <div className="text-4xl mb-3">teacher</div>
          <div className="text-lg font-semibold text-neutral-600 mb-2">
            Select Your Class
          </div>
          <div className="text-sm">
            Choose a grade level above to view your students.
          </div>
        </div>
      ) : loading ? (
        <Spinner center />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="user"
          title="No students found"
          description="Try a different grade or search term."
        />
      ) : (
        <div className="card">
          <div className="card-header">
            <span className="card-title">{filtered.length} Students</span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Full Name</th>
                  <th>USID</th>
                  <th>Gender</th>
                  <th>Date of Birth</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id}>
                    <td className="text-neutral-400 text-sm">{i + 1}</td>
                    <td className="font-medium">{s.fullName}</td>
                    <td>
                      <span className="usid-tag">{s.usid}</span>
                    </td>
                    <td className="text-sm">{s.gender}</td>
                    <td className="text-sm">{formatDate(s.dateOfBirth)}</td>
                    <td>
                      <Badge className={getStatusBadgeClass(s.status)}>
                        {s.status}
                      </Badge>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setSelected(s)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Student Profile"
        size="modal-lg"
      >
        {selected && <StudentDetail studentId={selected.id} />}
      </Modal>
    </div>
  );
}
