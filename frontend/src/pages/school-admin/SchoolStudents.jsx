import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { studentsApi, usersApi, referenceApi } from "../../api";
import { useToast } from "../../context/ToastContext";
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
import { FiEye, FiEyeOff, FiRefreshCw } from "react-icons/fi";

function StudentCreateModal({ isOpen, schoolId, onClose, onCreated }) {
  const toast = useToast();
  const [gradeLevels, setGradeLevels] = useState([]);
  const [loadingRefs, setLoadingRefs] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    username: "",
    email: "",
    password: "Welcome@123",
    dateOfBirth: "",
    gender: "",
    nationality: "Ghanaian",
    gradeLevelId: "",
    guardianName: "",
    guardianPhone: "",
    guardianRelation: "",
    address: "",
  });

  const setField = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const generatePassword = () => {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let generated = "";
    for (let i = 0; i < 12; i += 1) {
      generated += chars[Math.floor(Math.random() * chars.length)];
    }
    setForm((prev) => ({ ...prev, password: generated }));
  };

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      setLoadingRefs(true);
      try {
        const res = await referenceApi.getGradeLevels();
        setGradeLevels(res.data || []);
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Failed to load grade levels.",
        );
      } finally {
        setLoadingRefs(false);
      }
    })();
  }, [isOpen, toast]);

  useEffect(() => {
    if (!isOpen) return;
    setShowPassword(false);
    setSubmitting(false);
    setForm({
      firstName: "",
      middleName: "",
      lastName: "",
      username: "",
      email: "",
      password: "Welcome@123",
      dateOfBirth: "",
      gender: "",
      nationality: "Ghanaian",
      gradeLevelId: "",
      guardianName: "",
      guardianPhone: "",
      guardianRelation: "",
      address: "",
    });
  }, [isOpen]);

  const submit = async (e) => {
    e.preventDefault();
    if (!schoolId) {
      toast.error("School context is missing. Please reload and try again.");
      return;
    }
    setSubmitting(true);
    try {
      await usersApi.create({
        ...form,
        role: "STUDENT",
        schoolId,
        gradeLevelId: Number(form.gradeLevelId),
      });
      toast.success("Student account registered successfully.");
      onCreated();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to register student account.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register New Student"
      size="modal-lg"
    >
      <form onSubmit={submit} className="space-y-6">
        <section className="space-y-3">
          <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
            Student Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              className="input border border-neutral-200 rounded-xl p-2"
              placeholder="First name *"
              value={form.firstName}
              onChange={setField("firstName")}
              required
            />
            <input
              className="input border border-neutral-200 rounded-xl p-2"
              placeholder="Middle name (optional)"
              value={form.middleName}
              onChange={setField("middleName")}
            />
            <input
              className="input border border-neutral-200 rounded-xl p-2"
              placeholder="Last name *"
              value={form.lastName}
              onChange={setField("lastName")}
              required
            />
            <input
              className="input border border-neutral-200 rounded-xl p-2"
              type="date"
              value={form.dateOfBirth}
              onChange={setField("dateOfBirth")}
              required
              title="Date of birth"
            />
            <select
              className="input border border-neutral-200 rounded-xl p-2"
              value={form.gender}
              onChange={setField("gender")}
              required
            >
              <option value="">Gender *</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
            <select
              className="input border border-neutral-200 rounded-xl p-2"
              value={form.gradeLevelId}
              onChange={setField("gradeLevelId")}
              required
              disabled={loadingRefs}
            >
              <option value="">
                {loadingRefs
                  ? "Loading grade levels..."
                  : "Select grade level *"}
              </option>
              {gradeLevels.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.code || g.name}
                </option>
              ))}
            </select>
            <input
              className="input border border-neutral-200 rounded-xl p-2"
              placeholder="Nationality"
              value={form.nationality}
              onChange={setField("nationality")}
            />
          </div>
        </section>

        <section className="space-y-3">
          <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
            Guardian Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              className="input border border-neutral-200 rounded-xl p-2"
              placeholder="Guardian name"
              value={form.guardianName}
              onChange={setField("guardianName")}
            />
            <input
              className="input border border-neutral-200 rounded-xl p-2"
              placeholder="Guardian phone"
              value={form.guardianPhone}
              onChange={setField("guardianPhone")}
            />
            <input
              className="input border border-neutral-200 rounded-xl p-2"
              placeholder="Guardian relation (e.g. Mother)"
              value={form.guardianRelation}
              onChange={setField("guardianRelation")}
            />
            <input
              className="input border border-neutral-200 rounded-xl p-2 md:col-span-2"
              placeholder="Address"
              value={form.address}
              onChange={setField("address")}
            />
          </div>
        </section>

        <section className="space-y-3">
          <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
            User Account
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              className="input border border-neutral-200 rounded-xl p-2"
              placeholder="Username *"
              value={form.username}
              onChange={setField("username")}
              required
            />
            <input
              className="input border border-neutral-200 rounded-xl p-2"
              type="email"
              placeholder="Email *"
              value={form.email}
              onChange={setField("email")}
              required
            />
            <div className="md:col-span-2">
              <div className="relative">
                <input
                  className="input border border-neutral-200 rounded-xl p-2 pr-24"
                  type={showPassword ? "text" : "password"}
                  placeholder="Temporary password *"
                  value={form.password}
                  onChange={setField("password")}
                  minLength={8}
                  required
                />
                <div className="absolute inset-y-0 right-2 flex items-center gap-1">
                  <button
                    type="button"
                    className="p-1 text-neutral-500 hover:text-neutral-700"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword
                        ? "Hide password value"
                        : "Show password value"
                    }
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <FiEyeOff size={16} />
                    ) : (
                      <FiEye size={16} />
                    )}
                  </button>
                  <button
                    type="button"
                    className="p-1 text-neutral-500 hover:text-neutral-700"
                    onClick={generatePassword}
                    aria-label="Generate a secure password"
                    title="Generate password"
                  >
                    <FiRefreshCw size={16} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Use at least 8 characters. Student should change this password
                after first login.
              </p>
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create Student"}
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
