import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { referenceApi, usersApi, teacherAssignmentsApi } from "../../api";
import {
  PageHeader,
  SearchBar,
  Spinner,
  Badge,
  Pagination,
  Modal,
  EmptyState,
  ConfirmDialog,
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

function ManageAssignmentsModal({ isOpen, teacher, onClose, onUpdated }) {
  const toast = useToast();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gradeLevels, setGradeLevels] = useState([]);
  const [terms, setTerms] = useState([]);
  const [form, setForm] = useState({ gradeLevelId: "", termId: "" });
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const loadAssignments = useCallback(async () => {
    if (!teacher?.id) return;
    setLoading(true);
    try {
      const res = await teacherAssignmentsApi.getByTeacher(teacher.id);
      setAssignments(res.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }, [teacher, toast]);

  useEffect(() => {
    if (isOpen) {
      loadAssignments();
      (async () => {
        try {
          const [gradesRes, yearRes] = await Promise.all([
            referenceApi.getGradeLevels(),
            referenceApi.getCurrentYear(),
          ]);
          setGradeLevels(gradesRes.data || []);
          if (yearRes.data?.id) {
            const termsRes = await referenceApi.getTerms(yearRes.data.id);
            setTerms(termsRes.data || []);
          }
        } catch (err) {
          toast.error(
            err.response?.data?.message || "Failed to load reference data",
          );
        }
      })();
    }
  }, [isOpen, loadAssignments, toast]);

  const handleAssign = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await teacherAssignmentsApi.assign({
        teacherId: teacher.id,
        gradeLevelId: Number(form.gradeLevelId),
        termId: Number(form.termId),
      });
      toast.success("Teacher assigned successfully");
      setForm({ gradeLevelId: "", termId: "" });
      loadAssignments();
      onUpdated();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to assign teacher";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirmDelete) return;
    try {
      await teacherAssignmentsApi.deactivate(confirmDelete);
      toast.success("Assignment removed");
      setConfirmDelete(null);
      loadAssignments();
      onUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove assignment");
    }
  };

  if (!isOpen || !teacher) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Manage Assignments: ${teacher.fullName}`}
        size="modal-lg"
      >
        <div className="space-y-8">
          {/* Current Assignments Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                Active Assignments
              </h4>
              <Badge className="badge-primary">
                {assignments.filter((a) => a.active).length} Active
              </Badge>
            </div>

            {loading ? (
              <div className="py-8">
                <Spinner center />
              </div>
            ) : assignments.length === 0 ? (
              <div className="bg-neutral-50 rounded-lg border border-dashed border-neutral-300 p-8 text-center">
                <p className="text-sm text-neutral-500">
                  No active assignments found for this teacher.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden border border-neutral-200 rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">
                        Grade Level
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">
                        Term
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {assignments.map((a) => (
                      <tr
                        key={a.id}
                        className="hover:bg-neutral-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                          {a.gradeLevelCode}
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-600">
                          Term {a.termNumber}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={
                              a.active ? "badge-success" : "badge-neutral"
                            }
                          >
                            {a.active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {a.active && (
                            <button
                              className="text-error-600 hover:text-error-700 text-xs font-bold uppercase tracking-tight"
                              onClick={() => setConfirmDelete(a.id)}
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* New Assignment Form Section */}
          <section className="bg-neutral-50 p-6 rounded-xl border border-neutral-200">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">
              Assign to New Class
            </h4>
            <form
              onSubmit={handleAssign}
              className="flex flex-col md:flex-row gap-4"
            >
              <div className="flex-grow">
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Grade Level
                </label>
                <select
                  className="input border-neutral-300 focus:border-primary-500 w-full"
                  value={form.gradeLevelId}
                  onChange={(e) =>
                    setForm({ ...form, gradeLevelId: e.target.value })
                  }
                  required
                >
                  <option value="">Select Grade</option>
                  {gradeLevels.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.code || g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-grow">
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Academic Term
                </label>
                <select
                  className="input border-neutral-300 focus:border-primary-500 w-full"
                  value={form.termId}
                  onChange={(e) => setForm({ ...form, termId: e.target.value })}
                  required
                >
                  <option value="">Select Term</option>
                  {terms.map((t) => (
                    <option key={t.id} value={t.id}>
                      Term {t.termNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="btn btn-primary w-full md:w-auto px-8"
                  disabled={submitting}
                >
                  {submitting ? "Processing..." : "Assign"}
                </button>
              </div>
            </form>
          </section>

          <div className="flex justify-end">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeactivate}
        title="Remove Assignment"
        message="Are you sure you want to remove this teacher assignment? This teacher will no longer be able to manage records for this class."
        danger
      />
    </>
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
  const [manageOpen, setManageOpen] = useState(false);
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
    <div className="space-y-6">
      <PageHeader
        title="Teachers"
        subtitle="Manage teaching staff and their class assignments"
        action={
          <button
            className="btn btn-primary shadow-sm"
            onClick={() => setCreateOpen(true)}
          >
            + Register New Teacher
          </button>
        }
      />

      <div className="card shadow-sm border-neutral-200">
        <div className="card-header bg-white border-b border-neutral-100 flex items-center justify-between py-4">
          <div className="w-full max-w-md">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search by name, username, or email..."
            />
          </div>
          <div className="hidden sm:block">
            <Badge className="badge-neutral">{teachers.length} total</Badge>
          </div>
        </div>

        {loading ? (
          <div className="py-20">
            <Spinner center />
          </div>
        ) : teachers.length === 0 ? (
          <EmptyState
            icon="teacher"
            title="No teachers found"
            description="Teachers can be registered and then assigned to specific classes and terms."
          />
        ) : (
          <>
            <div className="table-wrapper">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      Teacher Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      Last Activity
                    </th>
                    <th className="px-6 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {teachers.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-neutral-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-neutral-900">
                          {t.fullName}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {t.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-700 font-mono">
                            {t.username}
                          </code>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          className={
                            t.isActive ? "badge-success" : "badge-neutral"
                          }
                        >
                          {t.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-neutral-500">
                        {t.lastLogin
                          ? formatDate(t.lastLogin)
                          : "Never logged in"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          className="btn btn-outline btn-sm font-medium"
                          onClick={() => {
                            setSelectedTeacher(t);
                            setManageOpen(true);
                          }}
                        >
                          Assignments
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-neutral-100">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
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

      <ManageAssignmentsModal
        isOpen={manageOpen}
        teacher={selectedTeacher}
        onClose={() => setManageOpen(false)}
        onUpdated={load}
      />
    </div>
  );
}
