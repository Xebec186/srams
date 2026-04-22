import React, { useState, useEffect, useCallback } from "react";
import { schoolsApi, referenceApi } from "../../api";
import {
  PageHeader,
  Spinner,
  Badge,
  Pagination,
  Modal,
  EmptyState,
} from "../../components/common";

const EMPTY_SCHOOL = {
  name: "",
  schoolCode: "",
  regionId: "",
  district: "",
  address: "",
  phone: "",
  email: "",
  schoolType: "COMBINED",
};

export default function AdminSchools() {
  const [schools, setSchools] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_SCHOOL);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    referenceApi.getRegions().then((r) => setRegions(r.data));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await schoolsApi.list({ page, size: 20 });
      setSchools(res.data.content || []);
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
      await schoolsApi.create({ ...form, regionId: Number(form.regionId) });
      setShowForm(false);
      setForm(EMPTY_SCHOOL);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create school.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Schools"
        subtitle="All registered public basic education schools"
        action={
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Add School
          </button>
        }
      />

      <div className="card">
        {loading ? (
          <Spinner center />
        ) : schools.length === 0 ? (
          <EmptyState
            title="No schools registered yet"
            description="Add the first school to get started."
          />
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>School Name</th>
                    <th>Region</th>
                    <th>District</th>
                    <th>Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {schools.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <span className="usid-tag">{s.schoolCode}</span>
                      </td>
                      <td className="font-semibold">{s.name}</td>
                      <td>{s.regionName}</td>
                      <td className="text-sm text-neutral-500">{s.district}</td>
                      <td>
                        <Badge className="badge-info">{s.schoolType}</Badge>
                      </td>
                      <td>
                        <Badge
                          className={
                            s.active ? "badge-success" : "badge-neutral"
                          }
                        >
                          {s.active ? "Active" : "Inactive"}
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
        title="Add New School"
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
              {saving ? "Saving..." : "Add School"}
            </button>
          </>
        }
      >
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">School Name *</label>
            <input
              className="form-control"
              value={form.name}
              onChange={setField("name")}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">School Code (4 digits) *</label>
            <input
              className="form-control"
              value={form.schoolCode}
              onChange={setField("schoolCode")}
              maxLength={4}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Region *</label>
            <select
              className="form-control"
              value={form.regionId}
              onChange={setField("regionId")}
              required
            >
              <option value="">Select region...</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">District *</label>
            <input
              className="form-control"
              value={form.district}
              onChange={setField("district")}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">School Type</label>
            <select
              className="form-control"
              value={form.schoolType}
              onChange={setField("schoolType")}
            >
              <option value="PRIMARY">Primary (KG–P6)</option>
              <option value="JHS">JHS (1–3)</option>
              <option value="COMBINED">Combined</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              className="form-control"
              type="tel"
              value={form.phone}
              onChange={setField("phone")}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Address</label>
          <input
            className="form-control"
            value={form.address}
            onChange={setField("address")}
          />
        </div>
      </Modal>
    </div>
  );
}
