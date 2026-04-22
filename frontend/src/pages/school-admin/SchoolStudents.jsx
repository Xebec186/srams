import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { studentsApi, usersApi, referenceApi } from "../../api";
import {
  PageHeader,
  SearchBar,
  Spinner,
  Badge,
  Pagination,
  Modal,
  EmptyState,
} from "../../components/common";
import { formatDate, getStatusBadgeClass } from "../../utils";
import StudentDetail from "../../components/students/StudentDetail";

function StudentCreateModal({ isOpen, schoolId, onClose, onCreated }) {
  const [gradeLevels, setGradeLevels] = useState([]);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "Welcome@123",
    gender: "",
    gradeLevelId: "",
  });

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      const res = await referenceApi.getGradeLevels();
      setGradeLevels(res.data || []);
    })();
  }, [isOpen]);

  const submit = async (e) => {
    e.preventDefault();
    await usersApi.create({
      ...form,
      role: "STUDENT",
      schoolId,
      gradeLevelId: form.gradeLevelId ? Number(form.gradeLevelId) : null,
    });
    onCreated();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register New Student"
      size="modal-lg"
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="input"
            placeholder="First name"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            required
          />
          <input
            className="input"
            placeholder="Last name"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            required
          />
          <input
            className="input"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <select
            className="input"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option value="">Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
          <select
            className="input md:col-span-2"
            value={form.gradeLevelId}
            onChange={(e) => setForm({ ...form, gradeLevelId: e.target.value })}
          >
            <option value="">Select grade level</option>
            {gradeLevels.map((g) => (
              <option key={g.id} value={g.id}>
                {g.code || g.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Create Student
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function SchoolStudents() {
  const { user } = useAuth();
  const schoolId = user?.schoolId;

  const [students, setStudents] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    try {
      const res = await studentsApi.list({
        schoolId,
        q: query.trim() || undefined,
        page,
        size: 20,
      });
      setStudents(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } finally {
      setLoading(false);
    }
  }, [schoolId, query, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(0);
  }, [query]);

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle="Students registered at your school"
        action={
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Register Student
          </button>
        }
      />

      <div className="card">
        <div className="card-header">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search by name, USID, or grade..."
          />
        </div>

        {loading ? (
          <Spinner center />
        ) : students.length === 0 ? (
          <EmptyState
            icon="user"
            title="No students found"
            description="Register a student account to get started."
          />
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>USID</th>
                    <th>Full Name</th>
                    <th>Grade</th>
                    <th>Gender</th>
                    <th>Enrolled</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <span className="usid-tag">{s.usid}</span>
                      </td>
                      <td className="font-medium">{s.fullName}</td>
                      <td>{s.gradeCode}</td>
                      <td className="text-sm">{s.gender}</td>
                      <td className="text-sm">
                        {s.enrollmentDate ? formatDate(s.enrollmentDate) : "—"}
                      </td>
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

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <StudentCreateModal
        isOpen={showForm}
        schoolId={schoolId}
        onClose={() => setShowForm(false)}
        onCreated={() => {
          setShowForm(false);
          load();
        }}
      />

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
