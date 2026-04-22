import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { referenceApi, usersApi, teacherAssignmentsApi } from "../../api";
import {
  PageHeader,
  SearchBar,
  Spinner,
  Badge,
  Pagination,
  Modal,
  EmptyState,
} from "../../components/common";
import TeacherForm from "../../components/teachers/TeacherForm";
import { formatDate } from "../../utils";

function normalizeUser(u) {
  if (!u) return null;
  const first = u.firstName || "";
  const last = u.lastName || "";
  return {
    ...u,
    fullName: `${first} ${last}`.trim() || "Unknown",
    isActive: Boolean(u.active ?? u.isActive ?? true),
  };
}

function AssignTeacherModal({
  isOpen,
  teacher,
  schoolId,
  onClose,
  onAssigned,
}) {
  const [gradeLevels, setGradeLevels] = useState([]);
  const [terms, setTerms] = useState([]);
  const [academicYearId, setAcademicYearId] = useState(null);
  const [form, setForm] = useState({ gradeLevelId: "", termId: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      const [gradesRes, yearRes] = await Promise.all([
        referenceApi.getGradeLevels(),
        referenceApi.getCurrentYear(),
      ]);
      setGradeLevels(gradesRes.data || []);
      setAcademicYearId(yearRes.data?.id || null);
      if (yearRes.data?.id) {
        const termsRes = await referenceApi.getTerms(yearRes.data.id);
        setTerms(termsRes.data || []);
      }
    })();
  }, [isOpen]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await teacherAssignmentsApi.assign({
        teacherId: teacher.id,
        gradeLevelId: Number(form.gradeLevelId),
        termId: Number(form.termId),
      });
      onAssigned();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !teacher) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign ${teacher.fullName} to class`}
      size="modal-lg"
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            className="input"
            value={form.gradeLevelId}
            onChange={(e) => setForm({ ...form, gradeLevelId: e.target.value })}
            required
          >
            <option value="">Select grade level</option>
            {gradeLevels.map((g) => (
              <option key={g.id} value={g.id}>
                {g.code || g.name}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={form.termId}
            onChange={(e) => setForm({ ...form, termId: e.target.value })}
            required
          >
            <option value="">Select term</option>
            {terms.map((t) => (
              <option key={t.id} value={t.id}>
                Term {t.termNumber} ({formatDate(t.startDate)} -{" "}
                {formatDate(t.endDate)})
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Assigning..." : "Assign Teacher"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function SchoolTeachers() {
  const { user } = useAuth();
  const schoolId = user?.schoolId;

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [createOpen, setCreateOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const load = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    try {
      const res = await usersApi.list({
        schoolId,
        role: "TEACHER",
        q: query.trim() || undefined,
        page,
        size: 20,
      });
      setTeachers((res.data?.content || []).map(normalizeUser).filter(Boolean));
      setTotalPages(res.data?.totalPages || 0);
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
        title="Teachers"
        subtitle="Teaching staff at your school"
        action={
          <button
            className="btn btn-primary"
            onClick={() => setCreateOpen(true)}
          >
            + Register Teacher
          </button>
        }
      />

      <div className="card mb-4">
        <div className="card-header">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search teachers by name, username, or email"
          />
        </div>

        {loading ? (
          <Spinner center />
        ) : teachers.length === 0 ? (
          <EmptyState
            icon="teacher"
            title="No teachers found"
            description="Teachers can now be created and assigned to classes by school admin."
          />
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>

                    <th>Status</th>
                    <th>Last Login</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((t) => (
                    <tr key={t.id}>
                      <td className="font-medium">{t.fullName}</td>
                      <td className="font-mono text-sm">{t.username}</td>
                      <td className="text-sm text-neutral-500">{t.email}</td>
                      <td>
                        <Badge
                          className={
                            t.isActive ? "badge-success" : "badge-neutral"
                          }
                        >
                          {t.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="text-sm text-neutral-400">
                        {t.lastLogin ? formatDate(t.lastLogin) : "Never"}
                      </td>
                      <td>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => {
                            setSelectedTeacher(t);
                            setAssignOpen(true);
                          }}
                        >
                          Assign to class
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

      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Register New Teacher"
        size="modal-lg"
      >
        <TeacherForm
          schoolId={schoolId}
          onSuccess={() => {
            setCreateOpen(false);
            load();
          }}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>

      <AssignTeacherModal
        isOpen={assignOpen}
        teacher={selectedTeacher}
        schoolId={schoolId}
        onClose={() => setAssignOpen(false)}
        onAssigned={load}
      />
    </div>
  );
}
