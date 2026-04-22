import React, { useState, useEffect, useCallback } from "react";
import { studentsApi } from "../../api";
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
import StudentForm from "../../components/students/StudentForm";
import StudentDetail from "../../components/students/StudentDetail";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentsApi.list({ q: query, page, size: 20 });
      setStudents(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    setPage(0);
  }, [query]);

  const handleRegistered = () => {
    setShowForm(false);
    load();
  };

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle="All registered students across the system"
        action={
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Register Student
          </button>
        }
      />

      <div className="card">
        <div className="card-header flex items-center justify-between gap-4">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search by name or USID..."
          />
          <span className="text-sm text-neutral-400">
            {students.length} records shown
          </span>
        </div>

        {loading ? (
          <Spinner center />
        ) : (
          <>
            {students.length === 0 ? (
              <EmptyState
                title="No students found"
                description="Try adjusting your search."
              />
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>USID</th>
                      <th>Full Name</th>
                      <th>School</th>
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
                        <td className="font-semibold">{s.fullName}</td>
                        <td className="text-sm text-neutral-500">
                          {s.schoolName}
                        </td>
                        <td>{s.gradeCode}</td>
                        <td>{s.gender}</td>
                        <td>{formatDate(s.enrollmentDate)}</td>
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
            )}
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Register New Student"
        size="modal-lg"
      >
        <StudentForm
          onSuccess={handleRegistered}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Student Profile"
        size="modal-lg"
      >
        {selected && (
          <StudentDetail
            studentId={selected.id}
            onClose={() => setSelected(null)}
          />
        )}
      </Modal>
    </div>
  );
}
