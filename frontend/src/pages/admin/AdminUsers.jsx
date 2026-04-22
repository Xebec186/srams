import React, { useState, useEffect, useCallback } from "react";
import { usersApi, schoolsApi } from "../../api";
import {
  PageHeader,
  Spinner,
  Badge,
  Modal,
  EmptyState,
  Pagination,
} from "../../components/common";
import { getRoleBadgeClass } from "../../utils";

const EMPTY = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  role: "SCHOOL_ADMIN",
  schoolId: "",
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    schoolsApi
      .list({ size: 200 })
      .then((r) => setSchools(r.data.content || []));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersApi.list({ page, size: 20 });
      setUsers(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const setField = (f) => (e) =>
    setForm((prev) => ({ ...prev, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await usersApi.create({
        ...form,
        schoolId: form.schoolId ? Number(form.schoolId) : null,
      });
      setShowForm(false);
      setForm(EMPTY);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user.");
    } finally {
      setSaving(false);
    }
  };

  const needsSchool = ["SCHOOL_ADMIN", "TEACHER"].includes(form.role);

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="System accounts and access management"
        action={
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Add User
          </button>
        }
      />

      <div className="card">
        {loading ? (
          <Spinner center />
        ) : users.length === 0 ? (
          <EmptyState
            title="No users found"
            description="Create a user account to get started."
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
                    <th>Role</th>
                    <th>School</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="font-semibold">
                        {u.firstName} {u.lastName}
                      </td>
                      <td className="font-mono text-sm">{u.username}</td>
                      <td className="text-sm text-neutral-500">{u.email}</td>
                      <td>
                        <Badge className={getRoleBadgeClass(u.role)}>
                          {u.role.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="text-sm">{u.schoolName || "—"}</td>
                      <td>
                        <Badge
                          className={
                            u.active ? "badge-success" : "badge-neutral"
                          }
                        >
                          {u.active ? "Active" : "Inactive"}
                        </Badge>
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
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Create User Account"
        footer={
          <>
            <button
              className="btn btn-outline"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "Creating..." : "Create User"}
            </button>
          </>
        }
      >
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">First Name *</label>
            <input
              className="form-control"
              value={form.firstName}
              onChange={setField("firstName")}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name *</label>
            <input
              className="form-control"
              value={form.lastName}
              onChange={setField("lastName")}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Username *</label>
            <input
              className="form-control"
              value={form.username}
              onChange={setField("username")}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              className="form-control"
              type="email"
              value={form.email}
              onChange={setField("email")}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Role *</label>
            <select
              className="form-control"
              value={form.role}
              onChange={setField("role")}
            >
              <option value="ADMIN">GES Admin</option>
              <option value="SCHOOL_ADMIN">School Admin</option>
              <option value="TEACHER">Teacher</option>
            </select>
          </div>
          {needsSchool && (
            <div className="form-group">
              <label className="form-label">School *</label>
              <select
                className="form-control"
                value={form.schoolId}
                onChange={setField("schoolId")}
                required={needsSchool}
              >
                <option value="">Select school...</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Temporary Password *</label>
            <input
              className="form-control"
              type="password"
              value={form.password}
              onChange={setField("password")}
              required
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
